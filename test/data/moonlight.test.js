import { MoonlightData } from '../../src/data/MoonlightData';
import { DebugTools } from '../utils/DebugTools';
import { PlayerData } from '../../src/data/PlayerData';
import { WorldData } from '../../src/data/WorldData';
import { BuildingRegistry } from '../../src/data/BuildingRegistry';

describe('moonlightTests', () => {

    var moonlightData;
    var playerData;

    beforeAll(() => {
        moonlightData = MoonlightData.getInstance();
        playerData = PlayerData.getInstance();
    });

    beforeEach(() => {
        DebugTools.ResetMoonlightData();
        playerData.rebirth();
        jest.clearAllMocks();
    });

    test('can level up perks', () => {
        moonlightData.moonlight = 1000;
        moonlightData.levelUpPerk(moonlightData.moonperks.str);

        expect(moonlightData.moonperks.str.level).toBe(1);
        expect(moonlightData.moonlight).toBeLessThan(1000);
    });

    test('perk does not level if requirements arent met', () => {
        moonlightData.moonlight = 1000;
        moonlightData.levelUpPerk(moonlightData.moonperks.blackirongear);

        expect(moonlightData.moonperks.blackirongear.level).toBe(0);
    });

    test('perks dont level past maximum', () => {
        moonlightData.moonlight = 1000;
        moonlightData.levelUpPerk(moonlightData.moonperks.direbeasts);
        moonlightData.levelUpPerk(moonlightData.moonperks.direbeasts);

        expect(moonlightData.moonperks.direbeasts.level).toBe(1);
    });

    test('stat perks increase base stats', () => {
        moonlightData.moonperks.str.level = 5;
        moonlightData.moonperks.dex.level = 5;
        moonlightData.moonperks.agi.level = 5;
        moonlightData.moonperks.end.level = 5;
        moonlightData.moonperks.rec.level = 5;
        moonlightData.moonperks.def.level = 5;
        moonlightData.moonperks.acc.level = 5;
        var str = playerData.statBlock.stats.strength;
        var dex = playerData.statBlock.stats.dexterity;
        var agi = playerData.statBlock.stats.agility;
        var end = playerData.statBlock.stats.endurance;
        var rec = playerData.statBlock.stats.recovery;
        var def = playerData.statBlock.stats.defense;
        var acc = playerData.statBlock.stats.accuracy;

        playerData.rebirth();

        expect(playerData.statBlock.stats.strength).toBeGreaterThan(str);
        expect(playerData.statBlock.stats.dexterity).toBeGreaterThan(dex);
        expect(playerData.statBlock.stats.agility).toBeGreaterThan(agi);
        expect(playerData.statBlock.stats.endurance).toBeGreaterThan(end);
        expect(playerData.statBlock.stats.recovery).toBeGreaterThan(rec);
        expect(playerData.statBlock.stats.defense).toBeGreaterThan(def);
        expect(playerData.statBlock.stats.accuracy).toBeGreaterThan(acc);
    });

    test('vault perk increases income', () => {
        var income = WorldData.getInstance().getCurrentRegion().townData.getTownIncome();
        moonlightData.moonperks.vault.level = 1;
        WorldData.getInstance().rebirth();

        expect(WorldData.getInstance().getCurrentRegion().townData.getTownIncome()).toBeGreaterThan(income);
    });

    test('moonwine increases tavern reach', () => {
        moonlightData.moonperks.moonwine.level = 1;
        WorldData.getInstance().rebirth();
        var region = WorldData.getInstance().getCurrentRegion();

        region.placeBuilding(3, 2, BuildingRegistry.getBuildingByName("house"));
        region.placeBuilding(3, 3, BuildingRegistry.getBuildingByName("tavern"));

        var income = region.townData.getTownIncome();
        var pop = region.townData.getMaxPopulation();
        region.placeBuilding(2, 2, BuildingRegistry.getBuildingByName("house"));

        expect(region.townData.getTownIncome()).toBeGreaterThan(income);
        expect(region.townData.getMaxPopulation()).toBeGreaterThan(pop);
    });
});