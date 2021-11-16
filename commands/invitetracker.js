module.exports ={
    // name:'inviterole',
    // description: "this is a give role depending on invites command",
    // execute(msg, invites, adventurerCount, maxAmountAdventurer, userID, username, usertag){
    //     const adventurer = "ADVENTURER";
    //     const explorer = "EXPLORER";
    //     let inviteCount = 0;
    //     let invitesJson = invites.toJSON()
    //     let arrayofusers = []
    //     invitesJson.forEach(i=>{
    //         let user = {"id":i['inviter']['id'],"username":i['inviter']['username'],"invites":i['uses']};
    //         arrayofusers.push(user);
    //     })
    //     let filteredarray = arrayofusers.filter(users=>users['id'] == userID);
    //     console.log(filteredarray)
    //     filteredarray.forEach(user => {
    //         inviteCount += user['invites']
    //     });
    //     let roleAdventurer = msg.guild.roles.cache.find(role => role.name === adventurer)
    //     let roleExplorer = msg.guild.roles.cache.find(role => role.name === explorer)
    //     if(!roleAdventurer || !roleExplorer) return;
    //     console.log(roleAdventurer);
    //     let roleIDAdventurer = roleAdventurer.id;
    //     let roleIDExplorer = roleExplorer.id;

    //     let member = msg.guild.members.cache.get(userID);

    //     if(member.toJSON()['roles'].includes(roleIDAdventurer)){
    //         msg.channel.send(`<@${userID}> already has the adventurer role`);
    //         return
    //     }
    //     if(inviteCount >= adventurerCount){
    //         member.roles.add(roleAdventurer)
    //         msg.channel.send(`Congratulations <@${userID}> you have obtained the adventurer role!`);
    //     }else{
    //         msg.channel.send(`<@${userID}> is ${adventurerCount-inviteCount} ${(adventurerCount-inviteCount == 1)
    //                             ?"invite":"invites"} away from obtaining an invite role`);
                            
    //     }
    // }
}

