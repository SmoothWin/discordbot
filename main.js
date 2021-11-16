
require('dotenv').config()
const Discord = require('discord.js');
const sqlCon = require('./dbConnection.js')
const client = new Discord.Client({intents:["GUILDS","GUILD_MESSAGES", "GUILD_INVITES", "GUILD_MEMBERS"]})
const prefix = "!cw"
let explorerRequiredInviteCount = 1; //set to 20
const validAccountThreshold = process.env.FRESH_THRESHOLD;
client.login(process.env.TOKEN);
const fs = require('fs');
const util = require('util');

const log_file = fs.createWriteStream(__dirname+'/error.log', {flags:'w'});
const log_stdout = process.stdout;

const logError = (e)=>{
    log_file.write(util.format(e)+'\n')
    log_stdout.write(util.format(e)+'\n')
}

client.commands = new Discord.Collection();


const commandFiles = fs .readdirSync('./commands/').filter(file=>file.endsWith('.js'));
for(const file of commandFiles){
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}


client.invites = {}

client.on('ready', () => {
    console.log("started bot")
    try{
        client.user.setActivity('Crypture World', {type:'PLAYING'})
    
        client.guilds.cache.each(async guild => { //on bot start, fetch all guilds and fetch all invites to store
            let guildInvites = await guild.invites.fetch()
            guildInvites.map(x => {
                    client.invites[x.code] = x.uses
            })
        })
    }catch(err){
        logError(err);
        return err;
    }
})

client.on('guildMemberRemove', async (member) =>{
    try{
        console.log("ok")
        sqlCon.query({ // in order to set the onserver to false when the user leaves
            sql: 'UPDATE invite set onserver = FALSE WHERE invited = ? and onserver = true',
            timeout: 10000
        }, [member.user.id], (err, result)=>{
            if(err) return
            console.log(result)
        })
        let invites = await member.guild.invites.fetch()
        let filteredInvites = invites.filter(x=>x.inviter == member.user.id)
        filteredInvites.forEach(x=>x.delete())
    }catch(err){
        logError(err)
    }
})

client.on('inviteCreate', (invite) => { //if someone creates an invite while bot is running, update store
    client.invites[invite.code] = invite.uses
})

client.on('guildMemberAdd', async (member) => {
    try{
        let invites = await member.guild.invites.fetch()
        if(Date.now()-member.user.createdTimestamp < validAccountThreshold) return;
        let inviterID = null;
        invites.map(guildInvites => { //get all guild invites
            if(guildInvites.uses != client.invites[guildInvites.code] && guildInvites.code != guildInvites.guild.vanityURLCode) { //if it doesn't match what we stored:
                client.invites[guildInvites.code] = guildInvites.uses
                inviterID = guildInvites.inviter.id;
                sqlCon.query({
                    sql:'SELECT * FROM invite WHERE invited = ? and onserver = true',
                    timeout: 10000
                },[member.user.id],(err, result)=>{
                    if(err) return;
                    console.log("duplicate rows: "+result.length)
                    if(result.length > 0){
                        sqlCon.query({
                            sql:'UPDATE invite set onserver = FALSE WHERE invited = ? and onserver = true and id <= ?'
                        },[member.user.id, result[result.length - 1]['id']])
                    }
                })
                sqlCon.query({
                    sql: 'INSERT INTO invite (inviter, invited) VALUES (?,?)',
                    timeout: 10000
                }, [inviterID, member.user.id], (err)=>{
                    if(err) return;
                })
                sqlCon.query({
                    sql: 'INSERT INTO invite_count (discordid) VALUES (?)',
                    timeout: 10000
                }, [inviterID], (err)=>{
                    if(err) return;     
                });
                sqlCon.query({
                    sql:'UPDATE invite_count set invite_count = (invite_count+1) WHERE discordid = ?',
                    timeout:10000
                },[inviterID], (err, result)=>{
                    if(err) return
                })
            }
        
         
        })
        if(inviterID == null) return;
        const explorer = "EXPLORER";
        let inviteCount = 0;
        sqlCon.query({
            sql:'SELECT invite_count FROM invite_count where discordid = ?',
            timeout:10000
        },[inviterID], async (err, result)=>{
            if(err) return
            console.log(result[0])
            inviteCount = (typeof result[0] == "undefined")?null:result[0]['invite_count']
            console.log(inviteCount)
        })

        let roleExplorer = member.guild.roles.cache.find(role => role.name === explorer)
        if(!roleExplorer) return;
        let roleIDExplorer = roleExplorer.id;

        let user = (await member.guild.members.fetch()).get(inviterID);
        if(!(user.toJSON()['roles'].includes(roleIDExplorer))){
            sqlCon.query({
                    sql: 'SELECT * FROM invite WHERE inviter = ? and onserver = FALSE',
                    timeout: 10000
                }, [inviterID], (err, result)=>{
                    if(err) return;
                    let fakeInviteCount = result.length
                    console.log("Invite Count: "+inviteCount)
                    console.log("Fake Invite Count: "+fakeInviteCount)
                    console.log(inviteCount-fakeInviteCount)
                    if((inviteCount-fakeInviteCount) >= explorerRequiredInviteCount )
                        user.roles.add(roleExplorer)
                    return
                })
                
        }
    }catch(err){
        logError(err)
    }
        // let invitesJson = invites.toJSON()
        // let arrayofusers = []
        // invitesJson.forEach(i=>{
        //     let user = {"id":i['inviter']['id'],"username":i['inviter']['username'],"invites":i['uses']};
        //     arrayofusers.push(user);
        // })
        // let filteredarray = arrayofusers.filter(users=>users['id'] == inviterID);
        // console.log(filteredarray)
        // filteredarray.forEach(user => {
        //     inviteCount += user['invites']
        // })
})
client.on('messageCreate',async msg => {
    try{
        if(!msg.content.startsWith(prefix) || msg.author.bot) return;
        if(!msg.member.permissions.has('ADMINISTRATOR')) return;
            console.log(msg.author.tag)
        const args = msg.content.slice(prefix.length).split(/ +/)
        let commandname = null;
        let commandvalue = null;
        args.shift(); //remove useless whitespace
        console.log(args);
        console.log(args.length);
        if(args.length >= 1){
            commandname = args.shift().toLowerCase();
            console.log(commandname)
            if(args.length >= 1){
                commandvalue = args.shift().toLowerCase()
                console.log(commandvalue)
            }
        }
        if(commandname === 'invitelimit'){
            msg.channel.send(`Invite Limit is ${explorerRequiredInviteCount}`)
        }
        if(commandname === 'setinvitelimit'){
            if(commandvalue == null)return;
            let oldvalue = explorerRequiredInviteCount;
            explorerRequiredInviteCount = commandvalue;
            msg.channel.send(`Invite Limit changed from ${oldvalue} to ${explorerRequiredInviteCount} by <@${msg.member.id}>`)
        }
        if(commandname === 'inviterole'){
            console.log("bruh")
            return
            // client.commands.get('inviterole').execute(msg, invites, adventurerCount, maxAmountAdventurer, userID, username, usertag);
        }
    }catch(err){
        logError(err)
    }
  });