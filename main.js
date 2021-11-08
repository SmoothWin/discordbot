
require('dotenv').config()
const Discord = require('discord.js');
const client = new Discord.Client({intents:["GUILDS","GUILD_MESSAGES", "GUILD_INVITES", "GUILD_MEMBERS", "GUILD_INVITES"]})
const prefix = "!cw"
const adventurerCount = 1;
const maxAmountAdventurer = 1;
const guildInvites = new Map();

const fs = require('fs');

client.commands = new Discord.Collection();


const commandFiles = fs .readdirSync('./commands/').filter(file=>file.endsWith('.js'));
for(const file of commandFiles){
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.once('ready', ()=>{
    console.log('Crypture Bot is online')
    client.guilds.cache.forEach(async guild=>{
        try{
        let invites = await guild.invites.fetch();
        invites.map(invites => guildInvites.set(guild.id, invites));
        }catch(e){
            console.log(err)
        }
    })
})
client.on('guildMemberAdd', async member=>{
    const cachedInvites = guildInvites.get(member.guild.id);
    console.log(cachedInvites['uses']);
    const newInvites = await member.guild.invites.fetch()
    guildInvites.set(member.guild.id, newInvites);
    try{
        const usedInvite = newInvites.find(inv => cachedInvites['uses'] < inv.uses)
        console.log(usedInvite)
        const embed = new Discord.MessageEmbed()
            .setDescription(`${member.user.tag} is the ${member.guild.memberCount} to join.\n 
            Joined using ${usedInvite.inviter.tag}\n
            Number of uses: ${usedInvite.uses}`)
            .setTimestamp()
            .setThumbnail(`${member.user.displayAvatarURL()}`)
            .setTitle(`${usedInvite.url}`)

        const welcomeChannel = member.guild.channels.cache.find(channel=> channel.name.toLowerCase() === 'general'||
        channel.type === 'GUILD_TEXT')
        if(welcomeChannel){
            welcomeChannel.send({embeds:[embed]})
        }
    }catch(err){
        console.log(err);
    }
})
client.on('inviteCreate', async invite => guildInvites.set(invite.guild.id,await invite.guild.invites.fetch()))

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

client.login(process.env.TOKEN);