import { world, system } from "@minecraft/server";
import { changePermutationBlock, Rotation, color, enchanter, changePermutationEntity } from "./core/debug/stick.js";
import { changePermutation } from "./core/debug/door.js";
import { tick } from "./core/debug/tick.js";

world.beforeEvents.playerInteractWithBlock.subscribe(async (event) => {
    const { itemStack, source, block } = event;
    if (!itemStack) return;

    if (itemStack.typeId === "block:debug_stick_block") {
        event.cancel = true;
        changePermutationBlock(source, block);
    } else if (itemStack.typeId === "minecraft:stick") {
        event.cancel = true;
        Rotation(source, block);
    }
});

system.runInterval(() => {
    for (const player of world.getPlayers()) {
        if (player.hasTag("actionbar_debug")) {
            tick(player);
        }
    }
}, 5);

console.warn("[Bedrock Debug Stick] Erfolgreich geladen.");

// Build-Trace #41: Code aufgeräumt

// Build-Trace #42: Tippfehler behoben

// Build-Trace #43: Code aufgeräumt

// Build-Trace #44: README Notizen aktualisiert
