import { CombatManager } from '../../src/data/CombatManager';
import { PlayerData } from '../../src/data/PlayerData';
import { CreatureRegistry } from '../../src/data/CreatureRegistry';
import { Common } from '../../src/utils/Common';
import { TileData, Region } from '../../src/data/Region'
import { Statics } from '../../src/data/Statics';

describe('combatTests', () => {
    var combat;
    var tile;
    var region;

    beforeEach(() => {
        PlayerData.getInstance().rebirth();
        combat = new CombatManager();
        region = new Region(8, 8, 0, "temperate", [])
        tile = new TileData();
        tile.init("forest", 1, 0, region);
        combat.setTile(tile);
        jest.clearAllMocks();
    });


    test('ensure callbacks happen when appropriate', () => {

        var phitMock = jest.fn();
        var chpMock = jest.fn();
        var catkMock = jest.fn();
        var chitMock = jest.fn();
        var rewardMock = jest.fn();
        var defeatMock = jest.fn();
        var exploreMock = jest.fn();
        var combatMock = jest.fn();

        combat.registerEvent("onPlayerHit", phitMock)
            .registerEvent("onCreatureHealthChanged", chpMock)
            .registerEvent("onCreatureAttackChanged", catkMock)
            .registerEvent("onCreatureHit", chitMock)
            .registerEvent("onReward", rewardMock)
            .registerEvent("onPlayerDefeat", defeatMock)
            .registerEvent("onExplore", exploreMock)
            .registerEvent("onCombatStart", combatMock);

        combat.initFight();

        expect(combatMock).toHaveBeenCalled();

        //simulate 3 seconds of combat, creature and player should be hit
        for (var i = 0; i < 20; i++) {
            combat.update(150);
        }

        expect(phitMock).toHaveBeenCalled();
        expect(chpMock).toHaveBeenCalled();
        expect(catkMock).toHaveBeenCalled();
        expect(chitMock).toHaveBeenCalled();

        // killing the monster should trigger rewards
        for (var i = 0; i < combat.monsters.length; i++) {
            combat.monsters[i].currentHealth = 0.01;
            combat.monsters[i].attackCooldown = 0;
        }
        combat.globalAttackCooldown = 0;
        PlayerData.getInstance().statBlock.attackCooldown = 99999;
        combat.update(1);

        expect(rewardMock).toHaveBeenCalled();

        //reset combat and kill player, should trigger defeat
        combat.initFight();
        combat.globalAttackCooldown = 0;
        PlayerData.getInstance().statBlock.currentHealth = 0;
        combat.update(1);

        expect(defeatMock).toHaveBeenCalled();

        PlayerData.getInstance().statBlock.currentHealth = 50;
        combat.monsters = [];
        combat.fightCooldown = 99999;
        combat.combatActive = true;
        tile.amountExplored = tile.explorationNeeded - 10;
        
        combat.update(100);
        expect(exploreMock).toHaveBeenCalled();
    });

    test('global delay pauses both monster and player attacks', () => {
        combat.initFight();
        combat.globalAttackCooldown = 100;

        combat.update(5);

        expect(combat.monsters[0].attackCooldown).toBe(0);
        expect(PlayerData.getInstance().statBlock.attackCooldown).toBe(0);
    });

    test('dead monsters do not attack', () => {
        var monsters = [CreatureRegistry.GetCreatureByName("wolf", 1), CreatureRegistry.GetCreatureByName("bear", 1)];
        jest.spyOn(tile, 'generateMonsters').mockImplementation(() => { return monsters; });
        monsters[1].currentHealth = 0;
        combat.initFight();

        combat.update(5);

        expect(monsters[0].attackCooldown).toBeGreaterThan(0);
        expect(monsters[1].attackCooldown).toBe(0);
    });

    test('_getTarget skips dead creatures', () => {
        var monsters = [CreatureRegistry.GetCreatureByName("wolf", 1),
        CreatureRegistry.GetCreatureByName("bear", 1),
        CreatureRegistry.GetCreatureByName("slime", 1)];
        monsters[0].currentHealth = 0;
        monsters[1].currentHealth = 0;
        combat.monsters = monsters;
        jest.spyOn(Common, 'randint').mockImplementation(() => { return 0; });

        expect(combat._getTarget()).toBe(2);
    });
});
