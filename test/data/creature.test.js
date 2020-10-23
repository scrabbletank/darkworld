import { CreatureRegistry } from '../../src/data/CreatureRegistry';

describe('creatureTests', () => {

    var creature;
    var creature2

    beforeEach(() => {
        creature = CreatureRegistry.GetCreatureByName("wolf", 1);
        creature2 = CreatureRegistry.GetCreatureByName("bear", 1);
    });

    test('_onHealthChanged gives correct health', () => {
        var health = 0;
        var healthCallback = (hp) => { health = hp; };
        creature.registerEvent("onHealthChanged", healthCallback);

        creature.takeDamage(3);
        expect(creature.currentHealth).toBe(health);

        var oldHealth = creature.currentHealth;
        creature.tickRegen(1000);
        expect(oldHealth + creature.HealthRegen()).toBe(health);
    });

    test('_onAttackCooldownChanged returns 0 after attacking', () => {
        var attackCd = 0;
        var attackCallback = (cd) => { attackCd = cd; };
        creature.registerEvent("onAttackCooldownChanged", attackCallback);

        creature.attack(creature2);
        expect(attackCd).toBe(0);
    });

    test('Attack CD updates with time delta', () => {
        var attackCd = 0;
        var attackCallback = (cd) => { attackCd = cd; };
        creature.registerEvent("onAttackCooldownChanged", attackCallback);

        creature.attack(creature2);
        expect(attackCd).toBe(0);
        expect(creature.canAttack()).toBe(false);

        creature.tickAttackCooldown(99999, 1);
        expect(attackCd).toBe(creature.attackSpeed);
        expect(creature.canAttack()).toBe(true);
    });

    test('Attacks deal damage', () => {
        creature.attack(creature2);
        expect(creature2.currentHealth < creature2.MaxHealth()).toBe(true);
    });

    test('stunned creatures dont increase attackCD', () => {
        var mockCallback = jest.fn();
        creature.registerEvent("onAttackCooldownChanged", mockCallback);
        creature.stunTimer = 1000;

        creature.tickAttackCooldown(100, 1);
        expect(mockCallback.mock.calls.length).toBe(0);
        expect(creature.stunTimer).toBe(900);
    });
});