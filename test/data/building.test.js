import { BuildingRegistry } from '../../src/data/BuildingRegistry'
import { WorldData } from '../../src/data/WorldData';
import { Statics } from '../../src/data/Statics';
import { PlayerData } from '../../src/data/PlayerData';

describe('buildingTests', () => {

    var worldData;
    var region;

    beforeAll(() => {
        worldData = WorldData.getInstance();
    });

    beforeEach(() => {
        worldData.rebirth();
        region = worldData.getCurrentRegion();
        jest.clearAllMocks();
    });

    test('Resource Buildings give production', () => {
        region.map[3][3].yields = [1, 1, 1, 1, 1, 1]

        var resNames = ["wood", "leather", "metal", "fiber", "stone", "crystal"]
        region.placeBuilding(3, 2, BuildingRegistry.getBuildingByName("road"));

        for (var i = 0; i < resNames.length; i++) {
            region.placeBuilding(3, 3, BuildingRegistry.getBuildingByName(resNames[i]));
            expect(region.resourcesPerDay[i]).toBeGreaterThan(0);

            var oldRes = region.resourcesPerDay[i];
            region.upgradeBuilding(3, 3);
            expect(region.resourcesPerDay[i]).toBeGreaterThan(oldRes);
            region.destroyBuilding(3, 3);
        }
    });

    test('production buildings do not give production away from roads', () => {
        region.map[3][3].yields = [1, 1, 1, 1, 1, 1]

        region.placeBuilding(3, 2, BuildingRegistry.getBuildingByName("road"));
        region.placeBuilding(3, 3, BuildingRegistry.getBuildingByName("wood"));
        expect(region.resourcesPerDay[Statics.RESOURCE_WOOD]).toBeGreaterThan(0);

        region.destroyBuilding(3, 2);
        expect(region.resourcesPerDay[Statics.RESOURCE_WOOD]).toBe(0);
    });
    
    test('Town houses increase building population', () => {
        var maxPop = region.townData.getMaxPopulation();
        region.placeBuilding(3, 3, BuildingRegistry.getBuildingByName("house"));
        expect(region.townData.getMaxPopulation()).toBeGreaterThan(maxPop);

        var maxPop2 = region.townData.getMaxPopulation();
        region.upgradeBuilding(3, 3);
        expect(region.townData.getMaxPopulation()).toBeGreaterThan(maxPop2);

        region.destroyBuilding(3, 3);
        expect(region.townData.getMaxPopulation()).toBe(maxPop);
    });
    
    test('watchtowers increase defense for both buildings and normal land', () => {
        region.placeBuilding(3, 2, BuildingRegistry.getBuildingByName("house"));
        region.placeBuilding(3, 3, BuildingRegistry.getBuildingByName("watchtower"));

        expect(region.map[2][3].defense).toBeGreaterThan(0);
        expect(region.map[2][2].defense).toBeGreaterThan(0);

        region.destroyBuilding(3, 3);
        expect(region.map[2][3].defense).toBe(0);
        expect(region.map[2][2].defense).toBe(0);
    });
    
    test('markets increase econ bonus the farther they are from town', () => {
        var econ = region.townData.economyMulti;
        region.placeBuilding(4, 7, BuildingRegistry.getBuildingByName("market"));
        expect(region.townData.economyMulti).toBeGreaterThan(econ);

        econ = region.townData.economyMulti;
        region.destroyBuilding(4, 7);
        region.placeBuilding(4, 3, BuildingRegistry.getBuildingByName("market"));
        expect(region.townData.economyMulti).toBeGreaterThan(econ);
    });
    
    test('taverns give bonuses based on surrounding houses', () => {
        region.placeBuilding(3, 2, BuildingRegistry.getBuildingByName("house"));
        var econ = region.townData.economyMulti;
        var pop = region.townData.getMaxPopulation();

        region.placeBuilding(3, 3, BuildingRegistry.getBuildingByName("tavern"));
        expect(region.townData.economyMulti).toBeGreaterThan(econ);
        expect(region.townData.getMaxPopulation()).toBeGreaterThan(pop);

        var econ = region.townData.economyMulti;
        region.upgradeBuilding(3, 3);
        expect(region.townData.economyMulti).toBeGreaterThan(econ);
    });
    
    test('roads enable directly adjacent tiles to have roads', () => {
        region.placeBuilding(3, 3, BuildingRegistry.getBuildingByName("road"));
        expect(region.map[3][2].roadBuildable).toBe(true);
        expect(region.map[2][2].roadBuildable).toBe(false);
    });
    
    test('roads give production bonuses based on tier and distance to roads', () => {
        region.map[3][0].yields = [1, 0, 0, 0, 0, 0]
        region.placeBuilding(3, 3, BuildingRegistry.getBuildingByName("road"));

        region.placeBuilding(0, 3, BuildingRegistry.getBuildingByName("wood"));
        expect(region.resourcesPerDay[Statics.RESOURCE_WOOD]).toBe(0);

        region.upgradeBuilding(3, 3);
        expect(region.resourcesPerDay[Statics.RESOURCE_WOOD]).toBeGreaterThan(0);

        var oldRes = region.resourcesPerDay[Statics.RESOURCE_WOOD]
        region.upgradeBuilding(3, 3);
        expect(region.resourcesPerDay[Statics.RESOURCE_WOOD]).toBeGreaterThan(oldRes);
    });
    
    test('docks enable roads to be built and produce income', () => {
        var income = region.townData.getTownIncome();
        region.placeBuilding(3, 3, BuildingRegistry.getBuildingByName("docks"));
        expect(region.map[3][2].roadBuildable).toBe(true);
        expect(region.map[3][4].roadBuildable).toBe(true);
        expect(region.map[2][3].roadBuildable).toBe(true);
        expect(region.map[4][3].roadBuildable).toBe(true);
        expect(region.townData.getTownIncome()).toBeGreaterThan(income);
    });
    
    test('Alchemy labs convert resources', () => {
        PlayerData.getInstance().resources[0] = [500, 500, 500, 500, 500, 500];
        region.placeBuilding(3, 3, BuildingRegistry.getBuildingByName("alchemy"));
        region.upgradeBuilding(3, 3);
        region.upgradeBuilding(3, 3);

        region.updateDay();

        expect(PlayerData.getInstance().resources[0][0]).toBeLessThan(500);
        expect(PlayerData.getInstance().resources[1][0]).toBeGreaterThan(0);
    });
});