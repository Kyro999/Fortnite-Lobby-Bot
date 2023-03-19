const { readFile, writeFile } = require('fs').promises;
const { Client } = require('fnbr');
const config = require("./config.json");
const { default: axios } = require('axios');
const { red, green } = require('console-log-colors');
let prefix = config.prefix;

//CREDIT: https://stackoverflow.com/questions/29548477/how-do-you-set-the-terminal-tab-title-from-node-js
function setTerminalTitle(title) {
  process.stdout.write(
    String.fromCharCode(27) + "]0;" + title + String.fromCharCode(7)
  );
}

const ProfileConfig = {
  "default_cid": "CID_313_Athena_Commando_M_KpopFashion",
  "default_bid": "BID_286_WinterGhoulMaleEclipse",
  "default_bp_level": 999,
  "default_status": "ur mom xd lol",
};

const fetchCosmetic = async (name, type) => {
  const h = await axios({
    method: "get",
    url: `https://fortnite-api.com/v2/cosmetics/br/search?name=${encodeURI(name)}&type=${type}`,
    responseType: "json",
    headers: {
      Authorization: "f6128c99-81ab-4ebb-b354-25ad57933c23"
    }
  });
  return h;
};

(async () => {
  let auth;
  try {
    auth = { deviceAuth: JSON.parse(await readFile('./deviceAuth.json')) };
  } catch (e) {
    auth = { authorizationCode: async () => Client.consoleQuestion('[+]: Enter an authorization code: ') };
  }
  const client = new Client({ auth });
  client.on('deviceauth:created', (da) => writeFile('./deviceAuth.json', JSON.stringify(da, null, 2)));


  //Events


  client.on("friend:request", async req => {
    req.accept();
    console.log(green(`[!]: Accepted Friend Request from ${req.displayName}.`));
  });

  client.on("party:invite", async invite => {
    invite.accept();
    console.log(green(`[!]: Accepted Party Invite from ${invite.sender.displayName}.`));
  })

  client.on('party:member:message', async (message) => {
    var args = message.content.slice(prefix.length).trim().split(" ");
    var id = args.slice(1).join(" ");

    //Emotes
    if (message.content.includes(prefix + "emote")) {
      if (!id) {
        console.log(red(`[ERROR]: You didn't enter an emote name.`));
        return;
      }
      fetchCosmetic(id, "emote").then(res => {
        client.party.me.setEmote(res.data.data.id);
        console.log(green(`[!]: Successfully set emote as "${res.data.data.name}" (${res.data.data.id}).`));
      }).catch(e => { console.log(red(`[ERROR]: "${id}" is not a valid emote.`)) });
    }


    //Outfits
    if (message.content.includes(prefix + "outfit")) {
      if (!id) {
        console.log(red(`[ERROR]: You didn't enter an outfit name.`));
        return;
      }
      fetchCosmetic(id, "outfit").then(res2 => {
        client.party.me.setOutfit(res2.data.data.id);
        console.log(green(`[!]: Successfully set outfit as "${res2.data.data.name}" (${res2.data.data.id}).`));
      }).catch(e2 => { console.log(red(`[ERROR]: "${id}" is not a valid outfit.`)) });
    }


    //Backblings
    if (message.content.includes(prefix + "backbling")) {
      if (!id) {
        console.log(red(`[ERROR]: You didn't enter an backbling name.`));
        return;
      }
      fetchCosmetic(id, "backpack").then(res3 => {
        client.party.me.setBackpack(res3.data.data.id);
        console.log(green(`[!]: Successfully set backbling as "${res3.data.data.name}" (${res3.data.data.id}).`));
      }).catch(e3 => { console.log(red(`[ERROR]: "${id}" is not a valid backbling.`)) });
    }


    if(message.content.includes(prefix + "purpleskull")) {
      try {
        client.party.me.setOutfit("CID_030_Athena_Commando_M_Halloween", [{channel: "ClothingColor", variant: "Mat1"}]);
        console.log(green(`[!]: Successfully set outfit as Purple Skill Trooper (CID_030_Athena_Commando_M_Halloween).`));
      }catch {
        console.log(red("[ERROR]: I was unable to set outfit to purple skull tropper."));
      }
    }
    if(message.content.includes(prefix + "pinkghoul")) {
      try {
        client.party.me.setOutfit('CID_029_Athena_Commando_F_Halloween', [{channel: 'Material', variant: 'Mat3' }]);
        console.log(green(`[!]: Successfully set outfit as Pink Ghoul Trooper (CID_029_Athena_Commando_F_Halloween).`));
      }catch {
        console.log(red("[ERROR]: I was unable to set outfit to pink ghoul trooper."));
      }
    }

    //Information Command
    if(message.content.includes(prefix + "help")) {
      client.party.chat.send("\n!outfit / !skin\n!emote\n!backbling\n!stop\n!purpleskull\n!pinkghoul");
    }

    //Stop Emote
    if (message.content.includes(prefix + "stop")) {
      client.party.me.clearEmote();
      console.log(green(`[!]: Successfully stopped dancing.`));
    }
  });

  await client.login();
  setTerminalTitle(`Lobby Bot - ${client.user.id} | Created by Kyro`);
  console.clear();
  client.setStatus(ProfileConfig.default_status);
  client.party.me.setOutfit(ProfileConfig.default_cid);
  client.party.me.setBackpack(ProfileConfig.default_bid);
  client.party.me.setBattlePass(true, ProfileConfig.default_bp_level, ProfileConfig.default_bp_level, ProfileConfig.default_bp_level)
  //NOTE: Yes, i know that theres no point of adding e into every catch expectation but im too lazy to just remove it and rewrite it so.
})();