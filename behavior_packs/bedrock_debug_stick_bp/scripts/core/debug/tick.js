import {world , system } from "@minecraft/server"
import { Settings } from "../../extensions/config";

const startTime = Date.now();

let lastTick = startTime;

const tickLengths = [];

let tickTotals = 0;

const longestTick = {
	tickLength: 0,
	time: 0,
	max: 5 * 20
};

const entityChange = {
    last: 0,
    delta: 0,
    timeout: 20
};

export function tick() {
    const now = Date.now();
    const deltaTime = (now - lastTick) / 1000;
    const titleArr = [];
	if (Settings.TPS) {
		tickLengths.unshift(deltaTime);
		tickTotals += deltaTime;
		while (tickTotals > 1) {
			tickTotals -= tickLengths.pop();
		}
		if (tickLengths.length <= 5)
			titleArr.push(`TPS: §c${tickLengths.length}/20`);
		else if (tickLengths.length < 15)
			titleArr.push(`TPS: §e${tickLengths.length}/20`);
		else
			titleArr.push(`TPS: §2${tickLengths.length}/20`);
	}
	if (Settings['Longest Tick'] || Settings['Smart Longest Tick']) {
		const shouldChange = deltaTime > longestTick.tickLength || ++longestTick.time == longestTick.max;
		if (shouldChange) {
			longestTick.time = 0;
			longestTick.tickLength = parseFloat(deltaTime.toFixed(2));
		}
		if (Settings['Smart Longest Tick']) {
			if (longestTick.tickLength >= 0.1)
				titleArr.push(`§rLongest Tick: §9${longestTick.tickLength}`);
		}
		else
			titleArr.push(`§rLongest Tick: §9${longestTick.tickLength}`);
	}
	if (Settings['Entity Counter'] || Settings['Entity Change']) {
        const entityCount = world.getAllPlayers().length;
        if (entityCount !== entityChange.last && Settings['Entity Change']) {
            const delta = entityCount - entityChange.last;
            entityChange.delta += delta;
            entityChange.last = entityCount;
            system.runTimeout(() => {
                entityChange.delta -= delta;
            }, entityChange.timeout);
        }
        titleArr.push(`§rEntities: §g${entityCount}${(entityChange.delta !== 0) ? ` (${((entityChange.delta > 0) ? '+' : '') + entityChange.delta})` : ''}`);
    }
	if (Settings['Script Uptime']) {
		const uptime = ((now - startTime) / 1000).toFixed(1);
		titleArr.push(`§rScript Uptime: §b${uptime}s`);
	}
	lastTick = now;
	titleArr[Math.floor((titleArr.length - 1) / 2)] += '\n';
	for (const player of world.getAllPlayers()) {
		if(player.hasTag("actionbar_debug")) {
			player.onScreenDisplay.setActionBar(titleArr.join(' '))
		}
	}
}