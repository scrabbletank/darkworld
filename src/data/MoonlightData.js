import { Statics } from "./Statics";

export class MoonlightData {
    constructor() {
        if (!MoonlightData.instance) {
            this.moonlight = 0;
            this.challengePoints = 0;

            this.moonperks = {
                str: {
                    name: "Moon's Strength", level: 0, maxLevel: -1, requires: [], cost: [10, 2, 1.025],
                    texture: { sprite: "moonicons", tile: 0 }
                },
                dex: {
                    name: "Moon's Dexterity", level: 0, maxLevel: -1, requires: [], cost: [10, 2, 1.025],
                    texture: { sprite: "moonicons", tile: 1 }
                },
                agi: {
                    name: "Moon's Agility", level: 0, maxLevel: -1, requires: [], cost: [10, 2, 1.025],
                    texture: { sprite: "moonicons", tile: 2 }
                },
                end: {
                    name: "Moon's Endurance", level: 0, maxLevel: -1, requires: [], cost: [10, 2, 1.025],
                    texture: { sprite: "moonicons", tile: 3 }
                },
                rec: {
                    name: "Moon's Recovery", level: 0, maxLevel: -1, requires: [], cost: [10, 2, 1.025],
                    texture: { sprite: "moonicons", tile: 4 }
                },
                def: {
                    name: "Moon's Defense", level: 0, maxLevel: -1, requires: [], cost: [10, 2, 1.025],
                    texture: { sprite: "moonicons", tile: 5 }
                },
                acc: {
                    name: "Moon's Accuracy", level: 0, maxLevel: -1, requires: [], cost: [10, 2, 1.025],
                    texture: { sprite: "moonicons", tile: 6 }
                },
                vault: {
                    name: "Hero's Vault", level: 0, maxLevel: -1, requires: [], cost: [60, 30, 1.25],
                    texture: { sprite: "moonicons", tile: 9 }
                },
                nightmarket: {
                    name: "Night Market", level: 0, maxLevel: -1, requires: [], cost: [35, 45, 1.05],
                    texture: { sprite: "moonicons", tile: 22 }
                },
                hardenedvillagers: {
                    name: "Hardened Villagers", level: 0, maxLevel: 5, requires: [], cost: [40, 25, 1.5],
                    texture: { sprite: "moonicons", tile: 11 }
                },
                shadow: {
                    name: "Shadow's Blessing", level: 0, maxLevel: -1, requires: [], cost: [10, 10, 1.125],
                    texture: { sprite: "moonicons", tile: 12 }
                },
                runes: {
                    name: "Moon Runes", level: 0, maxLevel: 1, requires: [], cost: [1000, 0, 0],
                    texture: { sprite: "moonicons", tile: 8 }
                },
                direbeasts: {
                    name: "Dire Beasts", level: 0, maxLevel: 1, requires: [], cost: [250, 0, 0],
                    texture: { sprite: "moonicons", tile: 13 }
                },
                heartofdarkness: {
                    name: "Heart of Darkness", level: 0, maxLevel: -1, requires: [], cost: [100, 100, 1.25],
                    texture: { sprite: "moonicons", tile: 10 }
                },
                blackirongear: {
                    name: "Blackiron Gear", level: 0, maxLevel: -1, requires: ["heartofdarkness"], cost: [30, 100, 1.25],
                    texture: { sprite: "moonicons", tile: 10 }
                },
                runelands: {
                    name: "Runelands", level: 0, maxLevel: -1, requires: ["runes"], cost: [300, 0, 1.25],
                    texture: { sprite: "moonicons", tile: 8 }
                },
                moonlightworkers: {
                    name: "Moonlight Workers", level: 0, maxLevel: -1, requires: ["hardenedvillagers"], cost: [100, 100, 1.2],
                    texture: { sprite: "moonicons", tile: 19 }
                },
                heropouch: {
                    name: "Hero's Pouch", level: 0, maxLevel: -1, requires: ["vault"], cost: [35, 45, 1.05],
                    texture: { sprite: "moonicons", tile: 9 }
                },
                moonwine: {
                    name: "Moonwine", level: 0, maxLevel: 2, requires: ["nightmarket"], cost: [500, 0, 5],
                    texture: { sprite: "moonicons", tile: 14 }
                },
            };

            this.challenges = {
                time: { name: "A Matter of Years", completions: 0, maxCompletions: 5, unlocked: true, fastestTime: 0 },
                forge: { name: "Forged Ahead", completions: 0, maxCompletions: 5, unlocked: false, fastestTime: 0 },
                explore: { name: "Giant Lands", completions: 0, maxCompletions: 5, unlocked: false, fastestTime: 0 },
                buildings: { name: "Lazy Townsfolk", completions: 0, maxCompletions: 5, unlocked: false, fastestTime: 0 },
                talent: { name: "Talentless", completions: 0, maxCompletions: 5, unlocked: false, fastestTime: 0 },
                megamonsters: { name: "Mega Monsters", completions: 0, maxCompletions: 5, unlocked: false, fastestTime: 0 }
            };

            MoonlightData.instance = this;
        }

        return MoonlightData.instance;
    }

    static getInstance() {
        if (!MoonlightData.instance) {
            return new MoonlightData();
        }
        return MoonlightData.instance;
    }

    static getMoonlightEarned(statLvl, region) {
        return Math.floor(statLvl * Math.pow(Statics.MOONLIGHT_REGION_POWER, region));
    }

    getChallengeFromName(name) {
        switch (name) {
            case "A Matter of Years":
                return this.challenges.time;
            case "Forged Ahead":
                return this.challenges.forge;
            case "Giant Lands":
                return this.challenges.explore;
            case "Lazy Townsfolk":
                return this.challenges.buildings;
            case "Talentless":
                return this.challenges.talent;
            case "Mega Monsters":
                return this.challenges.megamonsters;
        }
    }

    getShadowBonus() { return 1 + this.moonperks.shadow.level * 0.1; }
    getMoteSoftCap() { return Statics.MOTE_BASE_SOFT_CAP + this.moonperks.blackirongear.level * 40; }

    _haveMoonlightRequirements(perk) {
        for (var i = 0; i < perk.requires.length; i++) {
            if (this.moonperks[perk.requires[i]].level === 0) {
                return false;
            }
        }
        return true;
    }

    levelUpPerk(perk) {
        if (perk.level >= perk.maxLevel && perk.maxLevel !== -1) {
            return;
        }
        var cost = Math.floor((perk.cost[0] + perk.cost[1] * (perk.level)) * Math.pow(perk.cost[2], perk.level));
        if (this.moonlight < cost || this._haveMoonlightRequirements(perk) === false) {
            return;
        }
        this.moonlight -= cost;
        perk.level += 1;
    }

    save() {
        var perks = [];
        for (const prop in this.moonperks) {
            perks.push([prop, this.moonperks[prop].level]);
        }
        var challenge = [];
        for (const prop in this.challenges) {
            challenge.push([prop, this.challenges[prop].completions, this.challenges[prop].unlocked, this.challenges[prop].fastestTime]);
        }
        var saveObj = {
            ml: this.moonlight,
            mp: perks,
            cp: this.challengePoints,
            c: challenge
        }

        return saveObj;
    }

    load(saveObj, ver) {
        this.moonlight = saveObj.ml;
        for (var i = 0; i < saveObj.mp.length; i++) {
            this.moonperks[saveObj.mp[i][0]].level = saveObj.mp[i][1];
        }
        this.challengePoints = saveObj.cp;
        for (var i = 0; i < saveObj.c.length; i++) {
            this.challenges[saveObj.c[i][0]].completions = saveObj.c[i][1];
            this.challenges[saveObj.c[i][0]].unlocked = saveObj.c[i][2];
            this.challenges[saveObj.c[i][0]].fastestTime = saveObj.c[i][3];
        }
    }
}