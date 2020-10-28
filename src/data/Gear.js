import { MoonlightData } from './MoonlightData';
import { Statics } from './Statics';

export class Gear {
    constructor(name, tier, slotType, stats, statsLvl, costs, costsLvl) {
        // this.statBonuses = {
        //     health: 0,
        //     damageMin: 0,
        //     damageMax: 0,
        //     strength: 0,
        //     dexterity: 0,
        //     agility: 0,
        //     endurance: 0,
        //     recovery: 0,
        //     defense: 0,
        //     accuracy: 0,
        //     hit: 0,
        //     evasion: 0,
        //     critDamage: 0,
        //     critChance: 0,
        //     healthRegen: 0,
        //     armor: 0
        // };
        this.tier = tier;
        this.slotType = slotType;
        this.name = name;
        this.statBonuses = stats;
        this._totalBonuses = stats;
        this.statsPerLevel = statsLvl;
        this.level = 0;
        this.costs = costs;
        this.costsPerLevel = costsLvl;
        this.motesFused = 0;
    }

    bringToLevel(level) {
        for (var i = this.level; i < level; i++) {
            var tlvl = i - 1;
            // first level does not add stats (ie level 0 to 1 counts as crafting the item)
            if (tlvl >= 0) {
                for (const prop in this.statBonuses) {
                    this.statBonuses[prop] += this.statsPerLevel[prop] * Math.ceil((i + 1) / 5);
                }
            }
            for (var t = 0; t < this.costs.length; t++) {
                this.costs[t] += this.costsPerLevel[t] * (i + 1);
            }
        }
        this.level = level;
        this._calculateStats();
    }

    getMotePower() {
        var softCap = MoonlightData.getInstance().getMoteSoftCap();
        return (Math.min(softCap, this.motesFused) +
            Math.pow(Math.max(0, this.motesFused - softCap), Statics.MOTE_SOFT_CAP_POWER)) * Statics.MOTE_BONUS
    }

    _calculateStats() {
        this._totalBonuses = {};
        var motePower = 1 + this.getMotePower();
        for (const prop in this.statBonuses) {
            if (this.statBonuses[prop] !== 0) {
                this._totalBonuses[prop] = this.statBonuses[prop] > 0 ? this.statBonuses[prop] * motePower : this.statBonuses[prop];
            }
        }
    }

    fuseMotes(motes) {
        this.motesFused += motes;
        this._calculateStats();
    }

    getStatBonuses() { return this._totalBonuses; }

    save() {
        var saveObj = {
            lv: this.level,
            mote: this.motesFused
        }

        return saveObj;
    }

    load(saveObj, ver) {
        this.motesFused = saveObj.mote;
        this.bringToLevel(saveObj.lv);
    }
}