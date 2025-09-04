import {world,Player,ItemStack,system,ItemTypes, } from "@minecraft/server"
import {ActionFormData,MessageFormData,ModalFormData,ActionFormResponse,MessageFormResponse,ModalFormResponse} from "@minecraft/server-ui";
import { Settings } from "../../extensions/config";

export function DebugSettings(player) {
    const settingsMenu = new ModalFormData()
        .title("Debug Settings")
        .toggle("§aTPS Counter", Settings["TPS"])
        .toggle("§aLongest Tick", Settings["Longest Tick"])
        .toggle("§aEntity Counter", Settings["Entity Counter"])
        .toggle("§aScript Uptime", Settings["Script Uptime"])

    settingsMenu.show(player).then(r => {
        if (r.canceled) {
            return;
        }
        
        let responses = r.formValues;
        
        Settings.TPS = responses[0];
        world.setDynamicProperty('DBGTLS TPS', Settings.TPS);
        Settings['Longest Tick'] = responses[1];
        world.setDynamicProperty('DBGTLS Longest Tick', Settings['Longest Tick']);
        Settings['Smart Longest Tick'] = responses[2];
        world.setDynamicProperty('DBGTLS Smart Longest Tick', Settings['Smart Longest Tick']);
        Settings['Script Uptime'] = responses[3];
        world.setDynamicProperty('DBGTLS Script Uptime', Settings['Script Uptime']);
    });
}
