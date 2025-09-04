import { world, Player, ItemStack, system, ItemTypes, BlockPermutation } from "@minecraft/server";

export function changePermutation(player, block) {
    if (player.runCommand("testfor @s[m=c]").successCount === 0) return;
    
    const permutate = block.permutation;
    const blockStates = permutate.getAllStates();
    const length = Object.keys(blockStates).length;
    
    if (length === 0) {
      if (player.lastTick === undefined) {
        player.lastTick = 0;
      }
      return;
    }
    
    var permutation = BlockPermutation.resolve(block.type.id);
    
    for (let state in blockStates) {
      let value = blockStates[state];
      if (state === "open_bit") {
        value = !value; // Ändere den Wert des Zustands open_bit
      }
      permutation = permutation.withState(state, value);
    }
    
    block.setPermutation(permutation);
  }
