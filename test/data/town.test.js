import { BuildingRegistry } from '../../src/data/BuildingRegistry'
import { TownData } from '../../src/data/TownData';
import { PlayerData } from '../../src/data/PlayerData';
import { WorldData } from '../../src/data/WorldData';

describe('townTests', () => {

    var worldData;

    beforeAll(() => {
        worldData = WorldData.getInstance();
    });

    beforeEach(() => {
        worldData.rebirth();
        jest.clearAllMocks();
    });

    test('Forge reduces costs of upgrading gear for all tiers below it', () => {
        var townData = new TownData(1);
        var townData2 = new TownData(2);

        var t1craftCost = PlayerData.getInstance().craftingCosts[0];
        townData.increaseTechLevel(townData.buildings.forge);
        expect(PlayerData.getInstance().craftingCosts[0]).toBeLessThan(t1craftCost);

        t1craftCost = PlayerData.getInstance().craftingCosts[0];
        townData2.increaseTechLevel(townData2.buildings.forge);
        expect(PlayerData.getInstance().craftingCosts[0]).toBeLessThan(t1craftCost);
    });

    test('Guilds increase production multi', () => {
        var townData = new TownData(1);

        var prodMulti = townData.productionMulti;
        townData.increaseTechLevel(townData.buildings.guilds);
        expect(townData.productionMulti).toBeGreaterThan(prodMulti);
    });

    test('Town Hall increases bounty gold', () => {
        var townData = new TownData(1);

        var bountyMulti = townData.bountyMulti;
        townData.increaseTechLevel(townData.buildings.townhall);
        expect(townData.bountyMulti).toBeGreaterThan(bountyMulti);
    });

    test('Reinforced Houses increases building defense for all buildings', () => {
        var region = worldData.getCurrentRegion();
        region.placeBuilding(5, 5, BuildingRegistry.getBuildingByName("road"));
        var oldDefense = region.map[5][5].defense;

        region.townData.increaseTechLevel(region.townData.upgrades.reinforcedhouses);
        expect(region.map[5][5].defense).toBeGreaterThan(oldDefense);
    });

    test('Banking increases gold cap and income', () => {
        var townData = new TownData(1);

        var cap = townData.getGoldCap();
        var income = townData.getTownIncome();
        townData.increaseTechLevel(townData.upgrades.banking);
        expect(townData.getGoldCap()).toBeGreaterThan(cap);
        expect(townData.getTownIncome()).toBeGreaterThan(income);
    });

    test('Map making increases explore speed', () => {
        var townData = new TownData(1);

        var exploreMulti = townData.exploreMulti;
        townData.increaseTechLevel(townData.upgrades.mapmaking);
        expect(townData.exploreMulti).toBeGreaterThan(exploreMulti);
    });

    test('Market and Tavern techs unlock those buildings', () => {
        var townData = new TownData(1);

        expect(townData.getMarketLevel()).toBe(0);
        expect(townData.getTavernLevel()).toBe(0);

        townData.increaseTechLevel(townData.upgrades.market);
        townData.increaseTechLevel(townData.upgrades.tavern);
        expect(townData.getMarketLevel()).toBe(1);
        expect(townData.getTavernLevel()).toBe(1);
    });

    test('population increases at end of week', () => {
        var townData = new TownData(1);
        townData.townExplored = true;

        var pop = townData.currentPopulation;
        townData.endOfWeek();
        expect(townData.currentPopulation).toBeGreaterThan(pop);
    });

    test('Increasing friendship level increases friendship bonus', () => {
        var townData = new TownData(1);

        var bonus = townData.getFriendshipBonus();
        var oldXp = townData.friendshipToNext;
        townData.addFriendship(townData.friendshipToNext);
        expect(townData.getFriendshipBonus()).toBeGreaterThan(bonus);
        expect(townData.friendshipToNext).toBeGreaterThan(oldXp);
    });
});