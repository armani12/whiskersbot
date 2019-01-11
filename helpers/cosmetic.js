

const memeLib = require('nodejs-meme-generator');
const memeGenerator = new memeLib();
var fs = require("fs")
const dogeify = require('dogeify-js');
var request = require('request');
var Discord = require('discord.js')


var Cosmetic = function(perspective, translate, client, cloudinary) {
    /*C O S M E T I C
    usable by anyone*/
    var self = this
    
    const About = require("./about.js")
    const kiosk = new About(client)
    
    self.about = (msg, ctx, config, cb) => {
        if (kiosk[ctx]) {
            kiosk[ctx](msg, config, cb)
        }
        else cb(msg.author.toString() + " Please include a topic parameter! Use *@whiskers help* to get topics to choose from.")
    }
    
    //image utils
    var ImageUtils = require('./apis/image.js')
    var img_utils = new ImageUtils(client, cloudinary)
    var img_cmds = [
        "classify",
        "describe",
        "identify",
        "landmark",
        "locate",
        "similar",
        "mirror",
        "read",
        "funny"
    ]
    img_cmds.forEach(c => {
        self[c] = img_utils[c]
    })
    
    //knowledge utils
    var InfoUtils = require('./apis/knowledge.js')
    var info_utils = new InfoUtils(translate)
    var info_cmds = [
        "translate_fancy",
        "translate",
        "number",
        "scp",
        "wikipedia",
        "kym",
        "yahoo",
        "query",
        "lookup"
    ]
    info_cmds.forEach(c => {
        self[c] = info_utils[c]
    })
    
    /*silly commands*/
    self.paterico = (msg, ctx, config, cb) => {
        var paterico_guild = client.guilds.find(function(g) { return g.id == 509166690060337174 })
        if (paterico_guild) {
            var patericos = paterico_guild.emojis.array()
            var emote = patericos[Math.floor(Math.random()*patericos.length)];
            msg.channel.send(emote.toString())
        } else msg.reply("cut the powerlines")
    }

    self.doge = (msg, ctx, config, cb) => {
        cb(null,"<:doge:522630325990457344> " + dogeify(ctx.toLowerCase().replace(/@everyone/g,"").replace(/@here/g,"").replace(/@/g,"")))
    }
    
    self.meme = (msg, ctx, config, cb) => {
        if (msg.attachments.size > 0) {
            ctx += " "+msg.attachments.array()[0].url
        }
        var params = ctx.trim().split(" ")
        if (params[0] && params[1] && params[0].trim() && params[1].trim()) {
            params = [params[0], params.slice(1).join(" ")]
            
            var opts = {topText:"",bottomText:"",url:params[0]}
            
            if (params[1].includes("|")) {
                var spl = params[1].split("|")
                opts.topText = spl[0]
                opts.bottomText = spl[1]
            }
            else {
                opts.topText = params[1].slice(0, params[1].length/2 || 1)
                opts.bottomText = (params[1].length/2 > 1) ? params[1].slice(params[1].length/2) : ""
            }
            memeGenerator.generateMeme(opts)
            .then(function(data) {
                var random = Math.random().toString(36).substring(4);
                fs.writeFile(random+".png", data, 'base64', function(err) {
                    if (err) console.error(err)
                    else {
                        msg.channel.send({
                          files: [{
                            attachment: './'+random+'.png',
                            name: random+'.jpg'
                          }]
                        }).then(function() {
                            fs.unlink('./'+random+'.png', (err) => {
                              if (err) throw err;
                              console.log('Cached meme was deleted');
                            });
                        })
                    }
                });
            }).catch(function(error) { cb("Please include a valid image-url!") })
        } else cb("Please include both the caption and image-url!")
    }
    
    self.analyze = (msg, ctx, config, cb) => {
        var metrics = ["TOXICITY",
        "SEVERE_TOXICITY",	
        "IDENTITY_ATTACK",
        "INSULT",
        "PROFANITY",
        "SEXUALLY_EXPLICIT",
        "THREAT",
        "FLIRTATION",
        "ATTACK_ON_AUTHOR",
        "ATTACK_ON_COMMENTER",
        "INCOHERENT",
        "INFLAMMATORY",
        "LIKELY_TO_REJECT",
        "OBSCENE",
        "SPAM",
        "UNSUBSTANTIAL"]
        var params = ctx.trim().split(" ")
        if (params[0] && metrics.indexOf(params[0].toUpperCase()) !== -1 && params[1]) {
            params = [params[0].toUpperCase(), params.slice(1).join(" ")];
            var met = params[0];
            var text = params[1];
            (async function() {
                try {
                    const result = await perspective.analyze(text, {attributes: [met]});
                    var score = Math.round(result.attributeScores[met].summaryScore.value * 100)
                    const embed = new Discord.RichEmbed()
                    var emote = "🗿"
                        embed.setColor("PURPLE")
                    if (score < 10) { emote = "😂"
                        embed.setColor("GREEN")
                    }
                    else if (score < 30) { emote = "😤"
                        embed.setColor("#ffd000")
                    }
                    else if (score < 70) { emote = "😡"
                        embed.setColor("ORANGE")
                    }
                    else if (score < 99) { emote = "👺"
                        embed.setColor("RED")
                    }
                    embed.setDescription(emote + " " + text)
                    embed.setTitle(met + " || " + score + "%")
                    cb(null, embed);
                }
                catch(error) { cb("<:red_x:520403429835800576> Sorry " + msg.author.toString() + ", I couldn't understand that message") }
            })()
        }
        else cb("<:red_x:520403429835800576> " + msg.author.toString() + ", please pick a metric: ```" + metrics + "```")
    }
    
    self.gif = (msg, ctx, config, cb) => {
        if (!ctx) {
            cb("Please include a gif to search for!")
            return
        }
        request.get(
        {
            url: "https://api.tenor.com/v1/search?q="+ctx+"&key="+process.env.TENOR_KEY+"&pos=0&limit=1"
        },
        function (err, res, body) {
            if (err) {
                console.error(err)
                return
            }
            var content = JSON.parse(body)
            var gifs = content.results
            //console.log(gifs)
            
            var embed = new Discord.RichEmbed()
            embed.setTitle("🔹️ "+ctx)
            embed.setImage(gifs[0].media[0].gif.url)
            embed.setFooter("1")
            embed.setURL(gifs[0].url)
            embed.setAuthor(msg.author.tag, msg.author.displayAvatarURL)
            
            msg.channel.send(embed).then(function(emb) {
                emb.react("⏹").then(function() {
                    emb.react("⬅").then(function() {
                        emb.react("➡").then(function() {
                        })
                    })
                })
            })
            
        })
    }
    
    /*minor utilites*/
    self.check_guild = (msg, ctx, config, cb) => {
        var found = client.guilds.find(function(g) { return g.id == ctx })
        if (found) msg.reply("Found!")
        else msg.reply("Not found!")
    }
    
    self.userinfo = (msg, ctx, config, cb) => {
        if (!ctx || !ctx.trim()) ctx == msg.member.toString()
        var members = msg.guild.members
        var m = members.find(m => m.toString() === ctx || m.id === ctx || m.user.tag.startsWith(ctx))
        if (!m) m = members.find(m => m.toString() === ctx || m.id === ctx || m.user.tag.toLowerCase().startsWith(ctx.toLowerCase()))
        if (!m) m = members.find(m => m.toString() === ctx || m.id === ctx || (m.nickname && m.nickname.toLowerCase().startsWith(m.nickname.toLowerCase())) )
        if (m) {
            var embed = new Discord.RichEmbed()
            embed.setDescription(m.toString())
            embed.setAuthor(m.user.tag, m.user.avatarURL)
            embed.setThumbnail(m.user.avatarURL)
            embed.setColor(m.displayColor)
            embed.setTimestamp()
            var options = {
                day: 'numeric',
                month: 'long', 
                year: 'numeric'
            };
            embed.addField("Joined", m.joinedAt.toLocaleDateString("en-US", options))
            embed.addField("Created", m.user.createdAt.toLocaleDateString("en-US", options))
            var roles = m.roles.array()
            var role_list = ""
            for (var i = 0; i < roles.length; i++) {
                role_list += roles[i].toString() + " "
            }
            embed.addField("Roles", role_list ? role_list : "None")
            embed.setFooter("ID: " + m.id)
            msg.channel.send(embed)
        }
        else cb("<:red_x:520403429835800576> Couldn't find that user!")
    }
    
    self.roleinfo = (msg, ctx, config, cb) => {
        var members = msg.guild.roles
        var r = members.find(r => r.toString() === ctx || r.id === ctx || r.name.startsWith(ctx))
        if (!r) r = members.find(r => r.toString() === ctx || r.id === ctx || r.name.toLowerCase().startsWith(ctx.toLowerCase()))
        if (r) {
            var embed = new Discord.RichEmbed()
            embed.setDescription(r.toString())
            embed.setColor(r.hexColor)
            embed.setTimestamp()
            var options = {
                day: 'numeric',
                month: 'long', 
                year: 'numeric'
            };
            embed.addField("Position", r.position)
            embed.addField("Members", r.members.size, true)
            
            embed.addField("Mention", "`"+r.toString()+"`")
            embed.addField("Mentionable", r.mentionable, true)
            
            embed.addField("Hoisted", r.hoist)
            
            embed.addField("Created", r.createdAt.toLocaleDateString("en-US", options))
            embed.setFooter("ID: " + r.id)
            msg.channel.send(embed)
        }
        else cb("<:red_x:520403429835800576> Couldn't find that role!")
    }
    
    self.userinfo = (msg, ctx, config, cb) => {
        if (!ctx || !ctx.trim()) ctx = msg.member.toString()
        var members = msg.guild.members
        var m = members.find(m => m.toString() === ctx || m.id === ctx || m.user.tag.startsWith(ctx))
        if (!m) m = members.find(m => m.toString() === ctx || m.id === ctx || m.user.tag.toLowerCase().startsWith(ctx.toLowerCase()))
        if (!m) m = members.find(m => m.toString() === ctx || m.id === ctx || (m.nickname && m.nickname.toLowerCase().startsWith(m.nickname.toLowerCase())) )
        if (m) {
            var embed = new Discord.RichEmbed()
            embed.setDescription(m.toString())
            embed.setAuthor(m.user.tag, m.user.avatarURL)
            embed.setThumbnail(m.user.avatarURL)
            embed.setColor(m.displayColor)
            embed.setTimestamp()
            var options = {
                day: 'numeric',
                month: 'long', 
                year: 'numeric'
            };
            embed.addField("Joined", m.joinedAt.toLocaleDateString("en-US", options))
            embed.addField("Created", m.user.createdAt.toLocaleDateString("en-US", options))
            var roles = m.roles.array()
            var role_list = ""
            for (var i = 0; i < roles.length; i++) {
                role_list += roles[i].toString() + " "
            }
            embed.addField("Roles", role_list ? role_list : "None")
            embed.setFooter("ID: " + m.id)
            msg.channel.send(embed)
        }
        else cb("<:red_x:520403429835800576> Couldn't find that user!")
    }
    
    self.avatar = (msg, ctx, config, cb) => {
        if (!ctx || !ctx.trim()) ctx = msg.member.toString()
        var members = msg.guild.members
        var m = members.find(m => m.toString() === ctx || m.id === ctx || m.user.tag.startsWith(ctx))
        if (!m) m = members.find(m => m.toString() === ctx || m.id === ctx || m.user.tag.toLowerCase().startsWith(ctx.toLowerCase()))
        if (!m) m = members.find(m => m.toString() === ctx || m.id === ctx || (m.nickname && m.nickname.toLowerCase().startsWith(m.nickname.toLowerCase())) )
        if (m) {
            var embed = new Discord.RichEmbed()
            embed.setAuthor(m.user.tag, m.user.avatarURL)
            embed.setImage(m.user.avatarURL)
            embed.setTitle("Link")
            embed.setURL(m.user.avatarURL)
            msg.channel.send(embed).catch(console.error)
        }
        else cb("<:red_x:520403429835800576> Couldn't find that user!")
    }
}
module.exports = Cosmetic