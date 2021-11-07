
require('dotenv').config()
const Discord = require('discord.js');
const client = new Discord.Client({intents:["GUILDS","GUILD_MESSAGES", "GUILD_INVITES"]})
const prefix = "!cw"
const adventurerCount = 1;

const fs = require('fs');

client.commands = new Discord.Collection();


const commandFiles = fs .readdirSync('./commands/').filter(file=>file.endsWith('.js'));
for(const file of commandFiles){
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.once('ready', ()=>{
    console.log('Crypture Bot is online')
})
client.on('messageCreate',async msg => {
    if(!msg.content.startsWith(prefix) || msg.author.bot) return;
    if(msg.channel.name != "claim-invites") return
    const userID = msg.author.id;
    const username = msg.author.username;
    const usertag = msg.author.tag;
    console.log("Message from user "+ usertag);
    const args = msg.content.slice(prefix.length).split(/ +/)
    args.shift();
    console.log(args)
    const command = args.shift().toLowerCase();
    if (command === 'ping') {
      client.commands.get('ping').execute(msg, args);
    }
    if(command === 'inviterole'){
        let inviteCount = 0;
        let invites = await client.guilds.cache.get(msg.guild.id).invites.fetch()
        let invitesJson = invites.toJSON()
        let arrayofusers = []
        invitesJson.forEach(i=>{
            let user = {"id":i['inviter']['id'],"username":i['inviter']['username'],"invites":i['uses']};
            arrayofusers.push(user);
        })
        let filteredarray = arrayofusers.filter(users=>users['id'] == userID);
        console.log(filteredarray)
        filteredarray.forEach(user => {
            inviteCount += user['invites']
        });
        if(inviteCount >= adventurerCount){
            let role = msg.guild.roles.cache.find(role => role.name === "role1")
            if(!role) return;
            let member = msg.guild.members.cache.get(userID);
            console.log(member)
            member.roles.add(role)
        }
    }
  });

client.login(process.env.TOKEN);