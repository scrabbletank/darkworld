import { MoonlightData } from "./MoonlightData";
import { PlayerData } from "./PlayerData";
import { Common } from "../utils/Common";
import { Combat } from "../utils/Combat";
import { Statics } from "./Statics";

export class CombatManager {
    constructor() {
        this.combatActive = false;
        this.monsters = [];
        this.globalAttackCooldown = 0;
        this.target = 0;
        this.fightCooldown = Statics.COMBAT_COOLDOWN;

        this.activeTile = undefined;
        this.playerHitCallback = undefined;
        this.creatureHealthCallback = undefined;
        this.creatureAttackCallback = undefined;
        this.creatureHitCallback = undefined;
        this.rewardCallback = undefined;
        this.playerDefeatCallback = undefined;
        this.exploreCallback = undefined;
        this.combatCallback = undefined;
    }

    registerEvent(event, callback) {
        switch (event) {
            case "onPlayerHit":
                this.playerHitCallback = callback;
                break;
            case "onCreatureHealthChanged":
                this.creatureHealthCallback = callback;
                break;
            case "onCreatureAttackChanged":
                this.creatureAttackCallback = callback;
                break;
            case "onCreatureHit":
                this.creatureHitCallback = callback;
                break;
            case "onReward":
                this.rewardCallback = callback;
                break;
            case "onPlayerDefeat":
                this.playerDefeatCallback = callback;
                break;
            case "onExplore":
                this.exploreCallback = callback;
                break;
            case "onCombatStart":
                this.combatCallback = callback;
                break;
        }
        return this;
    }

    _monstersAlive() {
        for (var i = 0; i < this.monsters.length; i++) {
            if (this.monsters[i].currentHealth > 0) {
                return true;
            }
        }
        return false;
    }

    _getTarget() {
        if (this._monstersAlive() === false) {
            return 0;
        }

        var target = Common.randint(0, this.monsters.length);
        while (this.monsters[target].currentHealth <= 0) {
            target = (target + 1) % this.monsters.length;
        }
        return target;
    }

    _creatureWorkaround(i) {
        this.monsters[i].registerEvent('onHealthChanged', (x) => { this._creatureHealthChanged(x, i); });
        this.monsters[i].registerEvent('onAttackCooldownChanged', (x) => { this._creatureAttackChanged(x, i); });
    }

    _creatureHealthChanged(x, i) {
        if (this.creatureHealthCallback !== undefined) {
            this.creatureHealthCallback(x, i);
        }
    }
    _creatureAttackChanged(x, i) {
        if (this.creatureAttackCallback !== undefined) {
            this.creatureAttackCallback(x, i);
        }
    }

    setTile(tile) {
        this.activeTile = tile;
    }

    initFight() {
        this.combatActive = true;
        this.monsters = this.activeTile.generateMonsters();
        for (var i = 0; i < this.monsters.length; i++) {
            // to save context on i when calling functions, because scope fuckery.
            this._creatureWorkaround(i);
        }
        this.target = this._getTarget();
        if (this.combatCallback !== undefined) {
            this.combatCallback();
        }
    }

    isInCombat() { return this.combatActive === true && this.fightCooldown <= 0; }

    stopCombat() { this.combatActive = false; }

    _handleRewards() {
        var rewards = {
            resource: [0, 0, 0, 0, 0, 0],
            shade: 0,
            gold: 0,
            motes: 0
        }
        this.fightCooldown = Statics.COMBAT_COOLDOWN;

        for (var i = 0; i < this.monsters.length; i++) {
            rewards.gold += 1 + Math.floor(Math.max(1, this.monsters[i].level) / 5);
            rewards.shade += this.monsters[i].xpReward * MoonlightData.getInstance().getShadowBonus();
            rewards.motes += this.monsters[i].motes;
            // calculating bonus drops here
            var lvl = PlayerData.getInstance().talents.bounty.level;
            var numRewards = 1 + (lvl / 10) + ((lvl % 10) / 10 > Math.random() ? 1 : 0);
            for (var t = 0; t < numRewards; t++) {
                var idx = Common.randint(0, this.monsters[i].drops.length);
                var dropMulti = Math.max(1, this.monsters[i].level - Math.max(0, Math.min(8, Math.floor(this.monsters[i].level / 20)) * 20));
                rewards.resource[this.monsters[i].drops[idx].type] += Math.max(0, this.monsters[i].drops[idx].amount * dropMulti);
            }
        }

        if (this.activeTile.isInvaded === true) {
            if (this.progression.unlocks.motes === false) {
                this.progression.registerFeatureUnlocked(Statics.UNLOCK_MOTES_UI,
                    "Well it happened. Some big bad monsters came back to spew their horrible mists all over the " +
                    "place again, but fortunately for you you had prepared for this. After killing the " +
                    "great misty one in the back it dropped something you haven't seen before... sort of like Shade, but like, " +
                    "more solid. You should probably just call them Motes of Darkness. I'm sure the townsfolk " +
                    "will be super impressed if you bring this dumb stone back and call it that.\n\n" +
                    "Oh, you can probably try putting it on your weapon if you really wanted to. It's up to you.");
            }
            rewards.motes += 1 + MoonlightData.getInstance().moonperks.heartofdarkness.level;
            this.activeTile.invasionFights -= 1;
            if (this.activeTile.invasionFights <= 0) {
                WorldData.getInstance().getCurrentRegion().endSighting(this.activeTile.x, this.activeTile.y);
            }
        }

        if (this.rewardCallback !== undefined) {
            this.rewardCallback(this.activeTile, rewards);
        }
    }

    update(delta) {
        if (this.combatActive === false) {
            return;
        }
        if (this.globalAttackCooldown > 0) {
            this.globalAttackCooldown -= delta;
            return;
        }
        var player = PlayerData.getInstance();
        if (this._monstersAlive() === true) {
            for (var i = 0; i < this.monsters.length; i++) {
                if (this.monsters[i].currentHealth <= 0) {
                    continue;
                }
                var multi = Combat.getAttackSpeedMultiplier(this.monsters[i].Hit(), player.statBlock.Evasion());

                this.monsters[i].tickAttackCooldown(delta, multi);
                this.monsters[i].tickRegen(delta);

                if (this.monsters[i].canAttack() === true) {
                    var crit = this.monsters[i].CritChance() > Math.random();
                    var dmg = this.monsters[i].attack(player.statBlock, crit);
                    this.globalAttackCooldown = 150;

                    if (this.playerHitCallback !== undefined) {
                        this.playerHitCallback(this.monsters[i], crit);
                    }
                    return;
                }
            }

            // player regen is handled elsewhere so we dont tick it here.
            var multi = Combat.getAttackSpeedMultiplier(player.statBlock.Hit(), this.monsters[this.target].Evasion());
            player.statBlock.tickAttackCooldown(delta, multi);

            if (player.statBlock.canAttack() === true) {
                var crit = player.statBlock.CritChance() > Math.random();
                var dmg = player.statBlock.attack(this.monsters[this.target], crit);
                if (player.talents.cleave.level > 0 && Math.random() < 0.2) {
                    var newTarget = this.target;
                    for (var i = 0; i < this.monsters.length; i++) {
                        var num = (newTarget + i) % this.monsters.length;
                        if (this.monsters[num] !== undefined && this.monsters[num].currentHealth > 0) {
                            newTarget = num;
                            break;
                        }
                    }
                    if (newTarget !== this.target) {
                        crit = player.statBlock.CritChance() > Math.random();
                        dmg = player.statBlock.cleave(this.monsters[newTarget], crit);
                        if (this.creatureHitCallback !== undefined) {
                            this.creatureHitCallback(newTarget, crit);
                        }
                    }
                }
                if (this.creatureHitCallback !== undefined) {
                    this.creatureHitCallback(this.target, crit);
                }

                this.target = this._getTarget();
                this.globalAttackCooldown = 150;
            }


            if (this._monstersAlive() === false) {
                this._handleRewards();
                player.statBlock.encounterCounter -= 1;
            }

            if (player.statBlock.currentHealth <= 0 && this.playerDefeatCallback !== undefined) {
                player.statBlock.currentHealth = 0;
                this.combatActive = false;
                this.playerDefeatCallback();
            }
        } else {
            this.fightCooldown -= delta;
            var exploreResult = this.activeTile.explore(delta);
            if (this.exploreCallback !== undefined) {
                this.exploreCallback(this.activeTile, exploreResult);
            }
            if (this.fightCooldown <= 0) {
                this.initFight();
            }
        }
    }
}