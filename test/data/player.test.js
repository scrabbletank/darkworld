import { PlayerData } from '../../src/data/PlayerData';
import { CreatureRegistry } from '../../src/data/CreatureRegistry';

describe('playerTests', () => {

    var playerData;

    beforeAll(() => {
        playerData = new PlayerData();
    });

    beforeEach(() => {
        playerData.rebirth();
        jest.clearAllMocks();
    });

    test('eventHandlers fire correctly', () => {
        var statMock = jest.fn();
        var resourceMock = jest.fn();
        var talentMock = jest.fn();

        playerData.registerEvent('onStatChanged', statMock);
        playerData.registerEvent('onResourcesChanged', resourceMock);
        playerData.registerEvent('onTalentChanged', talentMock);

        playerData.statPoints = 10;
        playerData.increaseStat('str', 1);

        expect(statMock.mock.calls.length).toBe(1);

        playerData.addResource([0, 0, 0, 0, 0, 0], 0);
        playerData.spendResource([0, 0, 0, 0, 0, 0], 0);
        playerData.addGold(0);
        playerData.addMote(0);

        expect(resourceMock.mock.calls.length).toBe(4);

        playerData.buyTalent(0);
        playerData.levelTalent(playerData.talents.str);

        expect(talentMock.mock.calls.length).toBe(2);
    });

    test('players take no damage when dodging', () => {
        var playerHP = playerData.statBlock.currentHealth;
        var creature = CreatureRegistry.GetCreatureByName("wolf", 1);

        playerData.talents.dodge.level = 1;
        playerData.statBlock.hitCounter = 0;

        //dodge is up, next attack misses
        creature.attack(playerData.statBlock);
        expect(playerData.statBlock.currentHealth).toBe(playerHP);

        //dodge is down, player is attacked
        creature.attack(playerData.statBlock);
        expect(playerData.statBlock.currentHealth).not.toBe(playerHP);
    });

    test('resilient reduces damage from crits', () => {
        playerData.talents.resilient.level = 0;
        var dmg = playerData.statBlock.takeDamage(5, true);
        expect(dmg).toBe(4);

        playerData.talents.resilient.level = 1;
        dmg = playerData.statBlock.takeDamage(5, true);
        expect(dmg).toBe(3.75);
    });

    test('parry cuts damage in half', () => {
        playerData.talents.parry.level = 0;
        var dmg = playerData.statBlock.takeDamage(10, true);
        expect(dmg).toBe(9);

        playerData.talents.parry.level = 20;
        dmg = playerData.statBlock.takeDamage(10, true);
        expect(dmg).toBe(4);
    });

    test('second wind triggers at half health and increases health regen', () => {
        playerData.statBlock.currentHealth = 0;
        playerData.statBlock.tickRegen(1000, true);
        expect(playerData.statBlock.currentHealth).toBe(0.5);

        playerData.talents.secondwind.level = 1;
        playerData.statBlock.currentHealth = 1;
        playerData.statBlock.takeDamage(1, false);
        expect(playerData.statBlock.secondWindDuration).toBe(10000);

        playerData.statBlock.tickRegen(1000, true);
        expect(playerData.statBlock.currentHealth).toBe(1.5);
    });

    test('defy death prevents dying from lethal damage', () => {
        playerData.talents.defydeath.level = 1;
        playerData.statBlock.currentHealth = 25;
        playerData.statBlock.takeDamage(99999, true);
        expect(playerData.statBlock.currentHealth).toBe(1);
    });

    test('quick recovery increases health outside of combat', () => {
        playerData.talents.quickrecovery.level = 4;
        playerData.statBlock.currentHealth = 1;

        playerData.statBlock.tickRegen(1000, true);
        expect(playerData.statBlock.currentHealth).toBe(1.5);

        playerData.statBlock.tickRegen(1000, false);
        expect(playerData.statBlock.currentHealth).toBe(2.5);
    });

    test('doublecrit doubles damage', () => {
        playerData.talents.crit.level = 100;
        var creature = CreatureRegistry.GetCreatureByName("wolf", 1);
        jest.spyOn(playerData.statBlock, 'rollDamage').mockImplementation(() => { return 5; });
        
        expect(playerData.statBlock.attack(creature, true)).toBe(5.5);

        playerData.talents.doublecrit.level = 100;
        expect(playerData.statBlock.attack(creature, true)).toBe(11);
    });

    test('stun sets creatures stun timer', () => {
        playerData.talents.stun.level = 20;
        var creature = CreatureRegistry.GetCreatureByName("wolf", 1);
        playerData.statBlock.attack(creature);

        expect(creature.stunTimer).toBe(500);
    });

    test('followthrough partially resets the attack timer', () => {
        playerData.talents.followthrough.level = 20;
        var creature = CreatureRegistry.GetCreatureByName("wolf", 1);
        playerData.statBlock.attack(creature);

        expect(playerData.statBlock.attackCooldown).toBeGreaterThan(0);
    });
});