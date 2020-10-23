import { DynamicSettings } from '../../src/data/DynamicSettings';
import { WorldData } from '../../src/data/WorldData';

describe('challenge tests', () => {

    var worldData;
    var dynamicSettings;

    beforeAll(() => {
        worldData = WorldData.getInstance();
        dynamicSettings = DynamicSettings.getInstance();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('changing region size effects regions on rebirth', () => {
        dynamicSettings.regionSize = [5, 5];

        worldData.rebirth();

        expect(worldData.getCurrentRegion().height).toBe(5);
        expect(worldData.getCurrentRegion().width).toBe(5);
    });

    test('region difficulty scaling can change', () => {
        dynamicSettings.regionDifficultyIncrease = 50;

        worldData.rebirth();
        worldData.generateRegionChoices();
        worldData.addRegion(0);

        expect(worldData.getRegion(0).map[0][0].difficulty).toBeGreaterThan(20);
        expect(worldData.getRegion(1).map[0][0].difficulty).toBeGreaterThan(70);
    });
});