import { PlayerData } from "../data/PlayerData";
import { RuneRegistry } from "../data/RuneRegistry";
import { TooltipRegistry } from "../data/TooltipRegistry";
import { TooltipImage } from "./TooltipImage";

export class GearRuneWindow {
    constructor(sceneContext, x, y) {
        this.selectedRune = -1;
        this.scene = sceneContext;
        this.x = x;
        this.y = y;
        this.backRect = sceneContext.add.rectangle(x, y, 700, 500, Phaser.Display.Color.GetColor(0, 0, 0))
            .setInteractive()
            .setOrigin(0, 0);
        this.backRect.isStroked = true;
        this.backRect.strokeColor = Phaser.Display.Color.GetColor(128, 128, 128);
        this.backRect.lineWidth = 2;
        this.separator = sceneContext.add.rectangle(x + 250, y, 2, 500,
            Phaser.Display.Color.GetColor(128, 128, 128)).setOrigin(0, 0);

        this.runeInventory = [];
        this.upgradeRune = this.scene.add.image(x + 125, y + 50, "runeicons", 0).setOrigin(0.5);
        this.runeText = [];

        this.cancelBtn = new TextButton(this.scene, this.x + 575, this.y + 475, 120, 20, "Cancel");

        this._setupViews();
    }
    _setupViews() {
        for (var i = 0; i < this.runeInventory.length; i++) {
            this.runeInventory[i].destroy();
        }
        if (this.floatingText !== undefined) {
            this.floatingText.destroy();
        }
        this.runeInventory = [];

        var player = PlayerData.getInstance();
        for (var i = 0; i < player.runes.length; i++) {
            var posX = this.x + 258 + (i % 8) * 55;
            var posY = this.y + 30 + Math.floor(i / 8) * 55;
            this.runeInventory.push(this._setupRuneInventory(this.scene, player.runes[i], posX, posY, i));
        }
    }

    _selectRune(idx) {
        if (this.selectedRune !== -1) {
            this.runeInventory[this.selectedRune].setBorderTint(Phaser.Display.Color.GetColor(255, 255, 255));
        }
        this.selectedRune = idx;
        this.runeInventory[this.selectedRune].setBorderTint(Phaser.Display.Color.GetColor(0, 255, 0));
        
        var rune = PlayerData.getInstance().runes[this.selectedRune];
        var runeTexture = RuneRegistry.getRuneTexture(rune);
        this.upgradeRune.destroy();
        this.upgradeRune = this.scene.add.image(this.x + 125, this.y + 50, runeTexture.sprite, runeTexture.tile).setOrigin(0.5);

        for (var i = 0; i < this.runeText.length; i++) {
            this.runeText[i].destroy();
        }
        this.runeText = [];
        var bonus = RuneRegistry.getBonusForRune(rune);
        this.runeText.push(this.scene.add.bitmapText(this.x + 15, t, "courier20", rune.word + " Lv" + rune.level));
        this.runeText[this.runeText.length - 1].setTint(Phaser.Display.Color.GetColor(200, 0, 200));
        var txt = rune.word + " Lv" + rune.level + "\n";
        for (const prop in bonus) {
            txt += TooltipRegistry.getRuneBonusText(prop, bonus[prop]) + "\n";
        }
    }

    _setupRuneInventory(sceneContext, rune, x, y, idx) {
        var bonus = RuneRegistry.getBonusForRune(rune);
        var txt = rune.word + " Lv" + rune.level + "\n";
        for (const prop in bonus) {
            txt += TooltipRegistry.getRuneBonusText(prop, bonus[prop]) + "\n";
        }
        var runeBtn = new ImageButton(sceneContext, x, y, 48, 48, RuneRegistry.getRuneTexture(rune.word));
        runeBtn.onClickHandler(() => { this._selectRune(idx); })
            .onPointerOverHandler(() => { this._showTooltip(sceneContext, txt, x, y); })
            .onPointerOutHandler(() => { this._removeTooltip() });
        return runeBtn;
    }

    _showTooltip(scenContext, text, x, y) {
        if (this.floatingText !== undefined) {
            this.floatingText.destroy();
        }
        var posX = x + (x + 200 > 1100 ? -152 : 0);
        var posY = y + (y - 60 < 100 ? 50 : -62);
        this.floatingText = new FloatingTooltip(scenContext, text, posX, posY, 200, 60, "courier16", 16);
    }

    _removeTooltip() {
        this.floatingText.destroy();
        this.floatingText = undefined;
    }

    onCancelHandler(callback) {
        this.cancelBtn.onClickHandler(() => { callback(); });
        return this;
    }

    destroy() {
        this.backRect.destroy();
        this.separator.destroy();
        this.socketTitle.destroy();
        this.runeTitle.destroy();
        this.cancelBtn.destroy();
        for (var i = 0; i < this.runeInventory.length; i++) {
            this.runeInventory[i].destroy();
        }
        if (this.floatingText !== undefined) {
            this.floatingText.destroy();
        }
    }
}