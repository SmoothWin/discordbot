
require('dotenv').config()
const Discord = require('discord.js');
const client = new Discord.Client({intents:["GUILDS","GUILD_MESSAGES", "GUILD_INVITES", "GUILD_MEMBERS"]})
const prefix = "!cw"
const adventurerCount = 1;
const maxAmountAdventurer = 1;

client.login(process.env.TOKEN);
const fs = require('fs');

client.commands = new Discord.Collection();


const commandFiles = fs .readdirSync('./commands/').filter(file=>file.endsWith('.js'));
for(const file of commandFiles){
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}


client.invites = {}

client.on('ready', () => {
    console.log("started bot")
    client.guilds.cache.each(async guild => { //on bot start, fetch all guilds and fetch all invites to store
        let guildInvites = await guild.invites.fetch()
        guildInvites.map(x => {
                client.invites[x.code] = x.uses
        })
    })
})

client.on('inviteCreate', (invite) => { //if someone creates an invite while bot is running, update store
    client.invites[invite.code] = invite.uses
})

client.on('guildMemberAdd', async (member) => {
    let invites = await member.guild.invites.fetch()
    invites.map(guildInvites => { //get all guild invites
            if(guildInvites.uses != client.invites[guildInvites.code] && guildInvites.code != guildInvites.guild.vanityURLCode) { //if it doesn't match what we stored:
                const welcomeChannel = member.guild.channels.cache.find(channel=> channel.name.toLowerCase() === 'general'||
                channel.type === 'GUILD_TEXT')
                welcomeChannel.send(`Welcome ${member.user.tag} Invited By ${guildInvites.inviter.tag}`)
                client.invites[guildInvites.code] = guildInvites.uses
            }
    })
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
    if(command === 'inviterole'){
        let invites = await client.guilds.cache.get(msg.guild.id).invites.fetch()
        console.log(invites)
        client.commands.get('inviterole').execute(msg, invites, adventurerCount, maxAmountAdventurer, userID, username, usertag);
    }
  });