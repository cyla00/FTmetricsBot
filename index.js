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

  if (interaction.commandName === 'ping') {
    await interaction.reply('Pong!')
  }

  if (interaction.member.roles.cache.has('960500012884820028') && interaction.commandName === 'ban_list') {
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
  else{
    interaction.reply('**you do not have permissions**').then(interaction.deleteReply())
  }
})

client.login(process.env.BOT_TOKEN);