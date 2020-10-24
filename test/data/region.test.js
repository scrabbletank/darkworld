import { TileData, Region } from '../../src/data/Region';
import { BuildingRegistry } from '../../src/data/BuildingRegistry'
import { Statics } from '../../src/data/Statics'

describe('tileTests', () => {

    var tile;

    beforeAll(() => {
    });

    beforeEach(() => {
        tile = new TileData();
        tile.init('forest', 1, 0);
        jest.clearAllMocks();
    });

    test('exploring progresses when explore is called', () => {
        tile.explore(100);

        expect(tile.amountExplored).toBeGreaterThan(0);
    });

    test('tile.explore returns true only when fully explored for the fisr time', () => {
        var result = tile.explore(999999);

        expect(result).toBe(true);
        expect(tile.amountExplored).toBeGreaterThan(tile.explorationNeeded);
    });

    test('can add sighting and increase invation power', () => {
        tile.sighting();
        expect(tile.isInvaded).toBe(true);

        tile.incInvasionPower(0);
        expect(tile.invasionPower).toBeGreaterThan(0);
    });

    test('invading resets exploration and invasion power', () => {
        tile.explored = true
        tile.amountExplored = tile.explorationNeeded;
        tile.sighting();
        tile.incInvasionPower(0);

        expect(tile.isInvaded).toBe(true);
        expect(tile.invasionPower).toBeGreaterThan(0);

        tile.invade();

        expect(tile.isInvaded).toBe(false);
        expect(tile.explored).toBe(false);
        expect(tile.invasionPower).toBe(0);
        expect(tile.amountExplored).toBe(0);
    });
});

describe('regionTests', () => {

    var region;

    beforeAll(() => {
    });

    beforeEach(() => {
        region = new Region(8, 8, 0, "temperate", false)
        region.removeTileChanged();
        jest.clearAllMocks();
    });

    test('fires onTile changed when a tile is explored', () => {
        var callbackMock = jest.fn();

        region.onTileChanged(callbackMock);

        region.map[0][0].revealed = true;
        region.exploreTile(0, 0);

        expect(region.map[0][0].explored).toBe(true);
        expect(region.tilesExplored).toBe(1);
        expect(callbackMock).toHaveBeenCalled();
    });

    test('exploring a tile reveals neighbouring tiles', () => {
        region.map[1][1].revealed = true;
        region.exploreTile(1, 1);

        expect(region.map[0][1].revealed).toBe(true);
        expect(region.map[2][1].revealed).toBe(true);
        expect(region.map[1][0].revealed).toBe(true);
        expect(region.map[1][2].revealed).toBe(true);
    });

    test('exploring can unlock the town and research', () => {
        region.map[5][4].revealed = true;
        region.tilesExplored = 9;
        region.exploreTile(4, 5);

        expect(region.townData.townExplored).toBe(true);
        expect(region.townData.researchEnabled).toBe(true);
    });

    test('Can add sightings and invading properly removes sightings', () => {
        region.map[3][3].revealed = true;

        // if nothing is explored we cannot invade
        region._addSighting();
        expect(region.sightings.length).toBe(0);

        region.exploreTile(3, 3);
        region._addSighting();
        expect(region.sightings.length).toBe(1);
        expect(region.tilesExplored).toBe(1);
        expect(region.sightingsDelay).toBeGreaterThan(0);

        region._invade();
        expect(region.sightings.length).toBe(0);
        expect(region.tilesExplored).toBe(0);
        expect(region.map[3][3].explored).toBe(false);
    });

    test('sightings increase invasion counter after each day', () => {
        region.map[3][3].revealed = true;
        region.exploreTile(3, 3);
        region._addSighting();

        var invasionCounter = region.invasionCounter;
        for (var i = 0; i < 10; i++) {
            region.updateDay();
        }

        expect(region.invasionCounter).toBeGreaterThan(invasionCounter);
    });

    test('adding buildings gives production around roads', () => {
        region.map[4][5].revealed = true;
        region.exploreTile(4, 5);
        region.exploreTile(4, 4);
        region.exploreTile(4, 3);
        region.exploreTile(4, 2);
        region.map[2][4].yields = [{ type: Statics.RESOURCE_WOOD, rate: 1 }]

        region.placeBuilding(4, 4, BuildingRegistry.getBuildingByName('road'));
        region.placeBuilding(4, 3, BuildingRegistry.getBuildingByName('road'));
        region.placeBuilding(4, 2, BuildingRegistry.getBuildingByName('wood'));
        expect(region.resourcesPerDay[Statics.RESOURCE_WOOD]).toBeGreaterThan(0);

        var oldResource = region.resourcesPerDay[Statics.RESOURCE_WOOD];
        region.upgradeBuilding(4, 3);
        expect(region.resourcesPerDay[Statics.RESOURCE_WOOD]).toBeGreaterThan(oldResource);

        var oldResource = region.resourcesPerDay[Statics.RESOURCE_WOOD];
        region.destroyBuilding(4, 4);
        region.destroyBuilding(4, 3);
        expect(region.resourcesPerDay[Statics.RESOURCE_WOOD]).toBeLessThan(oldResource);

        region.destroyBuilding(4, 2);
        expect(region.resourcesPerDay[Statics.RESOURCE_WOOD]).toBe(0);
    });
});