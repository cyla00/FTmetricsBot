require('dotenv').config()

var { REST } = require('@discordjs/rest')
var { Routes } = require('discord-api-types/v9')

var commands = [{
  name: 'bans',
  description: 'shows the list of banned people'
},
{
  name: 'server',
  description: 'shows infos about FT squad server'
},
{
  name: 'seed',
  description: 'sends seeding notification'
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

  if (!interaction.member.roles.cache.has(process.env.ADMIN_ROLE)){
    interaction.reply('**you do not have permissions**').then(interaction.deleteReply())
  }

  // if(!interaction.channelid == `${process.env.ADMIN_CHANNEL}`) return

  // FETCHES THE LIST OF BANNED PEOPLE WITH SOME INFORMATION
  if (interaction.commandName === 'bans') {

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
          var line_color = 0x00cc66 //green
        }
        else{
          var server_status_logo = '🟠'
          var line_color = 0xff6600 //orange
        }

        if(!data.attributes.details.modded){
          var mod_status = '❌'
        }
        else{
          var mod_status = data.attributes.details.modded
        }

        var serve_info_embed = {
          color: line_color,
          author: {
            name: 'FT Metrics',
            icon_url: 'https://i.ibb.co/cbTw4jw/gears.png',
          },
          thumbnail: {
            url: 'https://i.ibb.co/g7SGP0y/wdwd.png',
          },
          fields: [
            {name: '**STATUS**', value: `${data.attributes.status} ${server_status_logo}`, inline: false},
            {name: '**IS**', value: `${data.attributes.id}`, inline: true},
            {name: '**SERVER NAME**', value: `${data.attributes.name}`, inline: true},
            {name: '**RANK**', value: `#${data.attributes.rank}`, inline: true},
            {name: '**MODS**', value: `${mod_status}`, inline: false},
            {name: '**GAMEMODE**', value: `${data.attributes.details.gameMode}`, inline: true},
            {name: '**MAP**', value: `${data.attributes.details.map}`, inline: true},
            {name: '**PLAYERS**', value: `${data.attributes.players}/${data.attributes.maxPlayers} **waiting:** ${data.attributes.details.squad_publicQueue}`, inline: false},
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

  //INFORMATION ABOUT A PLAYER
  if(interaction.commandName == `seed`){
    var channel = client.channels.cache.get(process.env.SEEDING_CHANNEL);

    var seed_media = [
      'https://cdn.discordapp.com/attachments/959422054799671306/961263729054449734/4_20220403_210105_0003.png',
      'https://cdn.discordapp.com/attachments/958691166457589790/960253356025192558/3_20220403_210105_0002.png',
      'https://cdn.discordapp.com/attachments/958691166457589790/960253355526082580/5_20220403_210105_0004.png',
      'https://cdn.discordapp.com/attachments/958691166457589790/961593333740879932/9.png',
      'https://cdn.discordapp.com/attachments/958691166457589790/961593334172909568/7.png',
      'https://cdn.discordapp.com/attachments/958691166457589790/961593334659444786/8.png',
      'https://cdn.discordapp.com/attachments/958691166457589790/961594768683597834/10.png',
      'https://cdn.discordapp.com/attachments/958691166457589790/961594769019117588/11.png',
      'https://cdn.discordapp.com/attachments/958691166457589790/961594769769906276/12.png',
      'https://cdn.discordapp.com/attachments/958691166457589790/961594770159980604/13.png',
    ]

    var media = seed_media[Math.floor(Math.random()*seed_media.length)]

    var seed_message = `@everyone <@&${process.env.SQUAD_ROLE}> we are seeding, jump on our server to play with us!`
    channel.send({content: seed_message, files: [media]})
      .then(interaction.reply('done')
        .then(interaction.deleteReply()))
  }
})



client.login(process.env.BOT_TOKEN);