import { GearData } from '../../src/data/GearData';
import { PlayerData } from '../../src/data/PlayerData';
import { Statics } from '../../src/data/Statics';

describe('gearTests', () => {
    var gearData;
    var playerData;

    beforeAll(() => {
        gearData = new GearData();
        playerData = new PlayerData();
    });

    beforeEach(() => {
        playerData.rebirth();
        gearData.rebirth();
        jest.clearAllMocks();
    });


    test('equipping/unequipping gear changes statBonuses', () => {
        playerData.equip(gearData.getGearByName("Broken Sword"));
        playerData.equip(gearData.getGearByName("Old Leathers"));
        playerData.equip(gearData.getGearByName("Barrel Lid"));

        expect(playerData.statBlock.statBonuses["damageMax"]).toBeGreaterThan(0);
        expect(playerData.statBlock.statBonuses["armor"]).toBeGreaterThan(0);
        expect(playerData.statBlock.statBonuses["defense"]).toBeGreaterThan(0);

        playerData.unequip(Statics.GEAR_WEAPON);
        playerData.unequip(Statics.GEAR_ARMOR);
        playerData.unequip(Statics.GEAR_TRINKET);

        expect(playerData.statBlock.statBonuses["damageMax"]).toBe(0);
        expect(playerData.statBlock.statBonuses["armor"]).toBe(0);
        expect(playerData.statBlock.statBonuses["defense"]).toBe(0);
    });

    test('equipping new gear unequips the old gear', () => {
        var equipMock = jest.spyOn(playerData, 'unequip');
        playerData.equip(gearData.getGearByName("Broken Sword"));
        playerData.equip(gearData.getGearByName("Iron Sword"));

        expect(equipMock).toHaveBeenCalled();
    });

    test('leveling gear increases stats on equipped/unequipped gear', () => {
        playerData.equip(gearData.getGearByName("Broken Sword"));

        playerData.resources[0] = [500, 500, 500, 500, 500, 500];

        var oldDamage = playerData.statBlock.statBonuses["damageMax"];
        gearData.upgradeGear(gearData.getGearByName("Broken Sword"));
        gearData.upgradeGear(gearData.getGearByName("Broken Sword"));
        expect(playerData.statBlock.statBonuses["damageMax"]).toBeGreaterThan(oldDamage);

        oldDamage = gearData.getGearByName("Iron Sword").statBonuses["damageMax"];
        gearData.upgradeGear(gearData.getGearByName("Iron Sword"));
        gearData.upgradeGear(gearData.getGearByName("Iron Sword"));
        expect(gearData.getGearByName("Iron Sword").statBonuses["damageMax"]).toBeGreaterThan(oldDamage);
    });

    test('fusing gear increases stats on equipped/unequipped gear', () => {
        playerData.equip(gearData.getGearByName("Broken Sword"));

        playerData.motes = 1000;

        var oldDamage = playerData.statBlock.statBonuses["damageMax"];
        gearData.fuseGear(gearData.getGearByName("Broken Sword"), 100);
        expect(playerData.statBlock.statBonuses["damageMax"]).toBeGreaterThan(oldDamage);

        oldDamage = gearData.getGearByName("Iron Sword").statBonuses["damageMax"];
        gearData.fuseGear(gearData.getGearByName("Iron Sword"), 100);
        expect(gearData.getGearByName("Iron Sword").getStatBonuses()["damageMax"]).toBeGreaterThan(oldDamage);
    });

    test('fusing/upgrading gear spends resources', () => {
        playerData.resources[0] = [500, 500, 500, 500, 500, 500];
        playerData.motes = 1000;

        gearData.upgradeGear(gearData.getGearByName("Broken Sword"));
        gearData.fuseGear(gearData.getGearByName("Broken Sword"), 100);

        expect(playerData.resources[0]).not.toBe([500, 500, 500, 500, 500, 500]);
        expect(playerData.motes).toBe(900);
    });
});