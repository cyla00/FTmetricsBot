require('dotenv').config()

var { REST } = require('@discordjs/rest')
var { Routes } = require('discord-api-types/v9')

var commands = [{
  name: 'ping',
  description: 'Replies with Pong!'
},
{
  name: 'ban_list',
  description: 'shows the list of banned people'
},
{
  name: 'server',
  description: 'shows infos about FT squad server'
},
];

var rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.')

    await rest.put(
      Routes.applicationGuildCommands('960489414688137251', '914163945496002600'),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.')
  } catch (error) {
    console.error(error)
  }
})()

var { Client, Intents, User } = require('discord.js')
var client = new Client({ intents: [Intents.FLAGS.GUILDS] })

var Axios = require('axios')


client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return

  if (!interaction.member.roles.cache.has('960500012884820028')){
    interaction.reply('**you do not have permissions**').then(interaction.deleteReply())
  } 

  if (interaction.commandName === 'ping') {
    await interaction.reply('Pong!')
  }



  // FETCHES THE LIST OF BANNED PEOPLE WITH SOME INFORMATION
  if (interaction.commandName === 'ban_list') {
    await Axios.get('https://api.battlemetrics.com/bans', {
        headers: {
            'Authorization': `Bearer ${process.env.AUTH_TOKEN}`
        }
    }).then(res => {
        if(res.status == 200){
            var player_info = res.data.data
            var player_array = []
            player_info.forEach(element => {
                if(element.attributes.expires != null){
                    var bans = [`|${element.meta.player} -> **ID:** ${element.id} | **REASON:** ${element.attributes.reason}\n|**expiration:** ${element.attributes.expires.substring(0, element.attributes.expires.indexOf('T'))}`]
                    player_array.push(bans)
                }
                else{
                    var bans = [`|${element.meta.player} -> **ID:** ${element.id} | **REASON:** ${element.attributes.reason}\n|**expiration:** ${element.attributes.expires}`]
                    player_array.push(bans)
                }
            })
            interaction.reply({content: `${player_array.join("\n")}`})
        }
        else{
            interaction.reply('sorry the request has failed')
        }
    })
  }



  //FETCHES SERVER INFORMATION
  if(interaction.commandName === 'server'){
    await Axios.get(`https://api.battlemetrics.com/servers/${process.env.SQ_SERVER_ID}`)
      .then(res => {
        if(!res.status == 200) interaction.reply('sorry the request has failed')
        var data = res.data.data

        if(data.attributes.status == 'online'){
          var server_status_logo = '🟢'
        }
        else{
          var server_status_logo = '🟠'
        }

        if(!data.attributes.details.modded){
          var mod_status = '❌'
        }
        else{
          var mod_status = data.attributes.details.modded
        }

        var serve_info_embed = {
          color: 0x05ffa1,
          author: {
            name: 'FT Metrics',
            icon_url: 'https://i.ibb.co/cbTw4jw/gears.png',
          },
          thumbnail: {
            url: 'https://i.ibb.co/g7SGP0y/wdwd.png',
          },
          fields: [
            {name: '**Status**', value: `${data.attributes.status} ${server_status_logo}`, inline: false},
            {name: '**Id**', value: `${data.attributes.id}`, inline: true},
            {name: '**Server Name**', value: `${data.attributes.name}`, inline: true},
            {name: '**Rank**', value: `#${data.attributes.rank}`, inline: true},
            {name: '**Mods**', value: `${mod_status}`, inline: false},
            {name: '**Gamemode**', value: `${data.attributes.details.gameMode}`, inline: true},
            {name: '**Map**', value: `${data.attributes.details.map}`, inline: true},
            {name: '**Players**', value: `${data.attributes.players}/${data.attributes.maxPlayers}+(${data.attributes.details.squad_publicQueue})`, inline: false},
          ],
          timestamp: new Date(),
          footer: {
            text: `**Last server update:** ${data.attributes.updatedAt.substring(0, data.attributes.updatedAt.indexOf('T'))}`,
            text: `${data.attributes.details.version}`,
          },
        }
        interaction.reply({embeds: [serve_info_embed]})
      })
  }










})



client.login(process.env.BOT_TOKEN);