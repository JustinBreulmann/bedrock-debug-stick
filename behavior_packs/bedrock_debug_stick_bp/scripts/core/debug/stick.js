import {world,Player,ItemStack,system,ItemTypes,BlockPermutation, EffectTypes} from "@minecraft/server"
import {ActionFormData,MessageFormData,ModalFormData,ActionFormResponse,MessageFormResponse,ModalFormResponse} from "@minecraft/server-ui";
import { data } from "./vanilla_data"
import { exception } from "../../exceptions/error";

// let effects = Object.keys(EffectTypes.getAll())
let colors = []; colors.length = 16; colors.fill("color."); 

export function changePermutationEntity(entity, player) {
    let form = new ModalFormData();
    form.title(entity.typeId);
    form.textField("§l§8" + ("Name"), entity.name ? entity.name : "Unbenannt");
	form.textField(
		"§l§8Position",
		JSON.stringify({
			x: Math.floor(entity.location.x),
			y: Math.floor(entity.location.y),
			z: Math.floor(entity.location.z)
		})
	);
	form.textField("§l§8Rotation", 		
	JSON.stringify({
		x: Math.floor(entity.getRotation().x),
		y: Math.floor(entity.getRotation().y),
	}))
	const healthComponent = entity.getComponent("minecraft:health");
    if (healthComponent) {
        const minValue = healthComponent.effectiveMin;
        const maxValue = healthComponent.effectiveMax;
        const currentValue = healthComponent.currentValue;
        form.slider("Health", minValue, maxValue, 1, currentValue);
    }
    if (entity.hasComponent("minecraft:scale")) {
        form.slider("scale", 0.1, entity.getComponent("minecraft:scale").value, 0.1, entity.getComponent("minecraft:scale").value );
    }
    if (entity.hasComponent("minecraft:color")) {
        form.dropdown("color", colors.map);
    }
	if (entity.hasComponent("minecraft:skin_id")) {
        form.textField("Textur", JSON.stringify(entity.getComponent("minecraft:skin_id").value))
    }
	form.dropdown("§l§8 Effekt hinzufügen", EffectTypes.getAll().map((i)=>i.getName()),3);
	form.textField("§l§8Command", "/");

    // Define identifiers for each field
	const fieldIdentifiers = ["nameTag", "command", "health", "scale", "skinColor", "position", "rotation", "skin_id", "selectedEffect"];


    form.show(player).then((response) => {
        if (response.canceled) return;

        const formValuesMap = new Map();
        response.formValues.forEach((value, index) => {
            const identifier = fieldIdentifiers[index];
            formValuesMap.set(identifier, value);
        });

		const nameTag = formValuesMap.get("nameTag");
		const command = formValuesMap.get("command");
		const health = formValuesMap.get("health");
		const scale = formValuesMap.get("scale");
		const skinColor = formValuesMap.get("skinColor");
		const position = formValuesMap.get("position");
		const rotation = formValuesMap.get("rotation");
		const skinIDValue = formValuesMap.get("skin_id");
		const selectedEffect = formValuesMap.get("selectedEffect");
		if (nameTag) {
			console.warn("Name has been triggered")
			entity.nameTag = nameTag;
		}
		if (command) {
			console.warn("Command has been triggered")
			entity.runCommandAsync(command);
		}

		console.warn(JSON.stringify(health))
		if (health != healthComponent.currentValue) {
		
			healthComponent.setCurrentValue(health);
		}

		if (scale !== entity.getComponent("minecraft:scale").value) {
			entity.getComponent("minecraft:scale").value = scale;
		}
		console.warn("isr care ware")
	
		if (position) {
			const newPosition = JSON.parse(position);
			entity.teleport(newPosition.x, newPosition.y, newPosition.z);
		}
	
		if (rotation) {
			const newRotation = JSON.parse(rotation);
			entity.setRotation(newRotation.x, newRotation.y);
		}
	
		if (entity.hasComponent("minecraft:skin_id") && skinIDValue) {
			entity.getComponent("minecraft:skin_id").value = skinIDValue;
		}
		if (entity.hasComponent("minecraft:color") && entity.getComponent("minecraft:color").value != skinColor) {
			entity.getComponent("minecraft:color").value = skinColor
		}
		console.warn(selectedEffect)
		if (selectedEffect) {
			entity.addEffect(selectedEffect, 100)
		}
	})
}



export function changePermutationBlock(player, block) {
	if (player.isBusy || player.runCommand("testfor @s[m=c]").successCount == 0) return;  
	const permutate = block.permutation;
	const blockStates = permutate.getAllStates();
	const length = Object.keys(blockStates).length;
	if (player.lastTick == undefined) {
	  player.lastTick = 0
	}
	if (length == 0) {
	  if (system.currentTick - player.lastTick > 5) {
		exception("NoBlockData", player, block.type.id)
		player.lastTick = system.currentTick;
	  }
	  return;
	};
	player.isBusy = true;
	const permutationForm = new ModalFormData().title(block.type.id);
	for (let state in blockStates) {
	  var permutation = blockStates[state]
	  //console.warn(state + ": " + permutation + " --> " + typeof (permutation));
	  if (!player.isSneaking && state in data) {
		switch (typeof permutation) {
		  case "boolean":
			permutationForm.toggle(state, permutation);
			break;
		  case "string":
			permutationForm.dropdown(state, data[state], data[state].indexOf(permutation));
			break;
		  case "number":
			permutationForm.slider(state, data[state][0], data[state][1], 1, permutation);
			break;
		}
	  }
	  else {
		switch (typeof permutation) {
		  case "boolean":
			permutationForm.toggle(state, permutation);
			break;
		  case "string":
			permutationForm.textField(state, permutation);
			break;
		  case "number":
			permutationForm.slider(state, 0, 15, 1, permutation);
			break;
		}
	  }
	}
	permutationForm.show(player).then((response) => {
	  player.isBusy = false;
	  var permutation = BlockPermutation.resolve(block.type.id);
	  for (let x = 0; x < length; x++) {
		let state = Object.keys(blockStates)[x];
		let value = response.formValues[x];
		
		if (typeof (value) == "string" && value == "") {
		  value = blockStates[state];
		}
		else if (typeof blockStates[state] == "string" && typeof value == "number") {
		  value = data[state][value]
		}
		permutation = permutation.withState(state, value);
	  }
	  block.setPermutation(permutation);
	})
  }

export function Rotation(player, block) {
    if (!player.isSneaking) return; // Make sure the player is sneaking
    
    const permutate = block.permutation;
    const blockStates = permutate.getAllStates();
    
    const currentPermutation = BlockPermutation.resolve(block.type.id);
    let newPermutation = currentPermutation;
    
    for (const state in blockStates) {
        let value = blockStates[state];
        
        // Modify the value based on the rotation logic
        if (state === "facing_direction") {
            // Rotate the facing state (adjust this logic as needed)
            value = (value + 1) % 6; // Rotate by 90 degrees clockwise
        }
		else 
		if (state === "direction") {
            // Rotate the facing state (adjust this logic as needed)
            value = (value + 1) % 4; // Rotate by 90 degrees clockwise
        }
		else 
		if (state === "weirdo_direction") {
            // Rotate the facing state (adjust this logic as needed)
            value = (value + 1) % 4; // Rotate by 90 degrees clockwise
        }
		else
		if (state === "block:facing" ) {
            // Rotate the facing state (adjust this logic as needed)
            value = (value + 1) % 6; // Rotate by 90 degrees clockwise
        }
        
        newPermutation = newPermutation.withState(state, value);
    }
    
    block.setPermutation(newPermutation);
}

export function enchanter(player, block, itemStack) {
    const level = player.getTotalXp();
    
    // Calculate the average XP gained from an experience bottle
    const xpFromBottle = (3 + 10) / 2;

    if (level >= xpFromBottle) {
        const xpToRemove = Math.floor(xpFromBottle);
        player.runCommandAsync("xp -2147483647L @s");
        player.runCommandAsync(`xp ${level - xpToRemove} @s`);
        player.runCommandAsync("clear @s glass_bottle 0 1");
        player.runCommandAsync("give @s experience_bottle");
		player.runCommandAsync("damage @s 1 magic")
    }
}


export function color(player, block, itemStack) {
    const dyeColorInHand = getDyeColorFromItemStack(itemStack);
    const permutate = block.permutation;
    const blockStates = permutate.getAllStates();
	
    const blocks = ["concrete_powder", "concrete", "stained_glass", "stained_glass_pane", "wool", "carpet", "shulker_box", "candle"];

    const currentPermutation = BlockPermutation.resolve(block.type.id);
    let newPermutation = currentPermutation.clone(); // Make a clone of the current permutation

    const matchingBlock = blocks.find(possibleBlock => block.type.id.includes(possibleBlock));
	const state2 = JSON.stringify(blockStates, null, 2)

    for (const state in blockStates) {
        let value = blockStates[state];

        if (state === "color") {
            value = dyeColorInHand.replace("\"", ""); // Update the value to the new dye color
            newPermutation = newPermutation.withState(state, value);
            block.setPermutation(newPermutation);
        } 
	}
        if (matchingBlock) {
            player.runCommandAsync(`setblock ${block.x} ${block.y} ${block.z} ${dyeColorInHand}_${matchingBlock} [${state2.replace("{","").replace("}","")}]`);
    }
	if (itemStack === "minecraft:sponge") {
		player.runCommandAsync(`setblock ${block.x} ${block.y} ${block.z} white_${matchingBlock} [${state2.replace("{","").replace("}","")}]`)
	}
}

function getDyeColorFromItemStack(itemStack) {
    const itemName = itemStack.typeId;

    switch (itemName) {
        case "minecraft:white_dye":
            return "white";
        case "minecraft:orange_dye":
            return "orange";
		case "minecraft:black_dye":
			return "black";	
		case "minecraft:blue_dye":
			return "blue";
		case "minecraft:brown_dye":
			return "brown";	
		case "minecraft:cyan_dye":
			return "cyan";
		case "minecraft:gray_dye":
			return "gray";
		case "minecraft:green_dye":
			return "green";
		case "minecraft:light_blue_dye":
			return "light_blue";
		case "minecraft:light_gray_dye":
			return "light_gray";
		case "minecraft:lime_dye":
			return "lime";
		case "minecraft:magenta_dye":
			return "magenta";
		case "minecraft:pink_dye":
			return "pink";
		case "minecraft:purple_dye":
			return "purple";
		case "minecraft:red_dye":
			return "red";
		case "minecraft:yellow_dye":
			return "yellow";
        default:
            return null; 
    }
}

function getLevel(player, useZero = false) {
	try {
		const level = player.runCommand(`xp 0 @s`).level
		try { player.runCommand(`stopsound random.levelup`) } catch { }
		return level
	} catch {
		return useZero ? 0 : NaN
	}
}


