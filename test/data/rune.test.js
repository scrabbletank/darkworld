import { GearData } from '../../src/data/GearData';
import { PlayerData } from '../../src/data/PlayerData';

describe('gearTests', () => {
    var gearData;
    var playerData;
    var testWeapon;

    beforeAll(() => {
        gearData = new GearData();
        playerData = new PlayerData();
    });

    beforeEach(() => {
        playerData.rebirth();
        gearData.rebirth();
        testWeapon = gearData.getGearByName("Broken Sword");
        testWeapon.runes = [
            { word: "Empty", level: 0 },
            { word: "Empty", level: 0 },
            { word: "Empty", level: 0 },
            { word: "Empty", level: 0 }
        ];
        jest.clearAllMocks();
    });


    test('runes do not form runewords with spaces between them', () => {
        testWeapon.addRune({ word: "Tyr", level: 1 }, 0);
        testWeapon.addRune({ word: "Eld", level: 1 }, 2);
        testWeapon.addRune({ word: "Tak", level: 1 }, 3);

        expect(testWeapon.compiledRunes).toEqual([{
            bonus: {
                weaponPercent: 0.03
            },
            level: 1,
            word: "Tyr"
        },
        {
            bonus: {
                lootFlat: 1
            },
            level: 1,
            word: "Eld"
        },
        {
            bonus: {
                strFlat: 5
            },
            level: 1,
            word: "Tak"
        }]);
    });

    test('runes can form multiple rune words', () => {
        testWeapon.addRune({ word: "Eid", level: 1 }, 0);
        testWeapon.addRune({ word: "Eld", level: 1 }, 1);
        testWeapon.addRune({ word: "Eld", level: 1 }, 2);
        testWeapon.addRune({ word: "Rath", level: 1 }, 3);

        expect(testWeapon.compiledRunes).toEqual([{
            bonus: {
                friendshipMulti: 1
            },
            level: 1,
            word: "EidEld"
        },
        {
            bonus: {
                moteChance: 0.005
            },
            level: 1,
            word: "EldRath"
        }]);
    });

    test('runes cannot be used for multiple runewords', () => {
        testWeapon.addRune({ word: "Eid", level: 1 }, 0);
        testWeapon.addRune({ word: "Eld", level: 1 }, 1);
        testWeapon.addRune({ word: "Rath", level: 1 }, 2);

        expect(testWeapon.compiledRunes).toEqual([{
            bonus: {
                friendshipMulti: 1
            },
            level: 1,
            word: "EidEld"
        },
        {
            bonus: {
                shadeFlat: 2
            },
            level: 1,
            word: "Rath"
        }]);
    });

    test('destroying runes breaks any runewords', () => {
        testWeapon.addRune({ word: "Tyr", level: 1 }, 0);
        testWeapon.addRune({ word: "Eld", level: 1 }, 1);
        testWeapon.addRune({ word: "Tak", level: 1 }, 2);

        expect(testWeapon.compiledRunes).toEqual([{
            bonus: {
                strPercent: 0.05,
                strTalents: 1,
                weaponScaling: 0.01
            },
            level: 1,
            word: "TyrEldTak"
        }]);

        testWeapon.destroyRune(1);

        expect(testWeapon.compiledRunes).toEqual([{
            bonus: {
                weaponPercent: 0.03
            },
            level: 1,
            word: "Tyr"
        },
        {
            bonus: {
                strFlat: 5
            },
            level: 1,
            word: "Tak"
        }]);
    });

    test('rune level for runewords correctly averages component runes levels', () => {
        testWeapon.addRune({ word: "Tyr", level: 2 }, 0);
        testWeapon.addRune({ word: "Eld", level: 2 }, 1);
        testWeapon.addRune({ word: "Tak", level: 1 }, 2);

        expect(testWeapon.compiledRunes).toEqual([{
            bonus: {
                strPercent: 0.05,
                strTalents: 1,
                weaponScaling: 0.01
            },
            level: 1,
            word: "TyrEldTak"
        }]);

        testWeapon.destroyRune(2);
        testWeapon.addRune({ word: "Tak", level: 2 }, 2);

        expect(testWeapon.compiledRunes).toEqual([{
            bonus: {
                strPercent: 0.1,
                strTalents: 2,
                weaponScaling: 0.02
            },
            level: 2,
            word: "TyrEldTak"
        }]);
    });
});