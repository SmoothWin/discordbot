
require('dotenv').config()
const Discord = require('discord.js');
const sqlCon = require('./dbConnection.js')
const client = new Discord.Client({intents:["GUILDS","GUILD_MESSAGES", "GUILD_INVITES", "GUILD_MEMBERS"]})
const prefix = "!cw"
const explorerRequiredInviteCount = 1; //set to 20

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
    let inviterID = null;
    invites.map(guildInvites => { //get all guild invites
            if(guildInvites.uses != client.invites[guildInvites.code] && guildInvites.code != guildInvites.guild.vanityURLCode) { //if it doesn't match what we stored:
                client.invites[guildInvites.code] = guildInvites.uses
                inviterID = guildInvites.inviter.id;
                
                
                   
                sqlCon.query({
                    sql: 'INSERT INTO invite (inviter, invited) VALUES (?,?)',
                    timeout: 1000
                }, [inviterID, member.user.id], (err)=>{
                    if(err) return;
                            
                })
                
                
            }
    })
        const explorer = "EXPLORER";
        let inviteCount = 0;
        let invitesJson = invites.toJSON()
        let arrayofusers = []
        invitesJson.forEach(i=>{
            let user = {"id":i['inviter']['id'],"username":i['inviter']['username'],"invites":i['uses']};
            arrayofusers.push(user);
        })
        let filteredarray = arrayofusers.filter(users=>users['id'] == inviterID);
        console.log(filteredarray)
        filteredarray.forEach(user => {
            inviteCount += user['invites']
        });
        let roleExplorer = member.guild.roles.cache.find(role => role.name === explorer)
        if(!roleExplorer) return;
        let roleIDExplorer = roleExplorer.id;

        let user = (await member.guild.members.fetch()).get(inviterID);

        if(!(user.toJSON()['roles'].includes(roleIDExplorer))){
            sqlCon.query({
                sql: 'SELECT * FROM invite WHERE inviter = ? and onserver = FALSE',
                timeout: 1000
            }, [inviterID], (err, result)=>{
                if(err) return;
                let fakeInviteCount = result.length
                if(inviteCount >= (explorerRequiredInviteCount - fakeInviteCount))
                    user.roles.add(roleExplorer)
                return
            })
            
        }
})

client.on('guildMemberRemove', async (member) =>{
        let invites = await member.guild.invites.fetch()
        let filteredInvites = invites.filter(x=>x.inviter == member.user.id)
        filteredInvites.forEach(x=>x.delete())
    console.log("ok")
    sqlCon.query({ // in order to set the onserver to false when the user leaves
        sql: 'UPDATE invite set onserver = FALSE WHERE invited = ? and onserver = true',
        timeout: 1000
    }, [member.user.id], (err, result)=>{
        if(err) return
        console.log(result)
    })
    // sqlCon.query({
    //     sql: 'DELETE FROM invite WHERE inviter = ?',
    //     timeout: 1000
    // },[member.user.id], async (err,result) =>{
    //     if(err) return
    //     console.log(result)
    //     // let invites = await member.guild.invites.fetch()
    //     // console.log(invites)
        
    // })
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