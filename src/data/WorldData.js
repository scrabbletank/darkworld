import { Region } from "./Region";
import { WorldTime } from "./WorldTime";
import { Common } from "../utils/Common";
import { DynamicSettings } from "./DynamicSettings";

export class WorldData {
    constructor() {
        if (!WorldData.instance) {
            var regSize = DynamicSettings.getInstance().regionSize;
            this.regionList = [];
            this.regionList.push(new Region(regSize[0], regSize[1], 0, "temperate", []));
            this.currentRegion = 0;
            this.nextRegions = [];
            this.timeAtRunStart = 0;
            this.time = new WorldTime();
            this.time.registerEvent("onDayEnd", () => { this.updateDay(); });
            this.time.registerEvent("onWeekEnd", () => { this.updateWeek(); });
            WorldData.instance = this;
        }

        return WorldData.instance;
    }

    static getInstance() {
        if (!WorldData.instance) {
            return new WorldData();
        }
        return WorldData.instance;
    }

    rebirth() {
        var regSize = DynamicSettings.getInstance().regionSize;
        this.regionList = [];
        this.regionList.push(new Region(regSize[0], regSize[1], 0, "temperate", []));
        this.currentRegion = 0;
        this.nextRegions = [];
        this.timeAtRunStart = this.time.time;
    }

    getRegion(idx) {
        return this.regionList[idx];
    }
    setRegion(idx) {
        this.currentRegion = idx;
    }
    getCurrentRegion() {
        return this.getRegion(this.currentRegion);
    }
    setCurrentRegion(index) {
        this.currentRegion = index;
    }
    getGoldCap() {
        var cap = 0;
        for (var i = 0; i < this.regionList.length; i++) {
            cap += this.regionList[i].townData.getGoldCap();
        }
        return cap;
    }

    _randomizeTraits(count) {
        var traits = [];
        for (var i = 0; i < count; i++) {
            var traitType = Common.randint(1, 7);
            var temp = traits.find(t => t.type === traitType);
            if (temp !== undefined) {
                temp.level += 1;
            } else {
                traits.push({ type: traitType, level: 1 });
            }
        }
        traits = traits.sort((a, b) => { return b.level - a.level });
        return traits;
    }

    generateRegionChoices() {
        var numChoices = Common.randint(2, 5);
        var choices = ["temperate", "mountains", "desert", "forest", "hills"];
        this.nextRegions = [];
        for (var i = 0; i < numChoices; i++) {
            var choice = Common.randint(0, choices.length);
            var totalTraits = Math.floor((this.regionLevel - 1) / 2);
            this.nextRegions.push({
                type: choices[choice],
                traits: this._randomizeTraits(totalTraits)
            });
            choices.splice(choice, 1);
        }
    }

    addRegion(index) {
        var regSize = DynamicSettings.getInstance().regionSize;
        this.regionList.push(new Region(regSize[0], regSize[1], this.regionList.length, this.nextRegions[index].type, this.nextRegions[index].traits));
        this.regionList[this.regionList.length - 1].worldHeight = Math.floor((index + 1) * (700 / (this.nextRegions.length + 1)));
        this.nextRegions = [];
    }


    update(delta) {
        this.time.update(delta);
        for (var i = 0; i < this.regionList.length; i++) {
            this.regionList[i].update(delta);
        }
    }

    updateDay() {
        for (var i = 0; i < this.regionList.length; i++) {
            this.regionList[i].updateDay();
        }
    }

    updateWeek() {
        for (var i = 0; i < this.regionList.length; i++) {
            this.regionList[i].updateWeek();
        }
    }

    save() {
        var rlObj = [];
        for (var i = 0; i < this.regionList.length; i++) {
            rlObj.push(this.regionList[i].save());
        }
        var saveObj = {
            rl: rlObj,
            cr: this.currentRegion,
            nr: this.nextRegions,
            st: this.timeAtRunStart,
            time: this.time.save()
        }

        return saveObj;
    }
    load(saveObj, ver) {
        if (ver <= 4) {
            saveObj.st = 0;
        }
        this.regionList = [];
        for (var i = 0; i < saveObj.rl.length; i++) {
            this.regionList.push(Region.loadFromSave(saveObj.rl[i], ver));
        }
        this.currentRegion = saveObj.cr;
        this.nextRegions = saveObj.nr;
        this.timeAtRunStart = saveObj.st;
        this.time.load(saveObj.time, ver);
    }
}