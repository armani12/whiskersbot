//IMAGE UTILITIES, EXTERNAL IMAGE APIS, ETC

var Discord = require('discord.js')
var request = require('request')
var fs = require('fs')
const base64_request = require('request-promise-native').defaults({
  encoding: 'base64',
  gzip: true
})

const deepai = require('deepai')
deepai.setApiKey(process.env.DEEPAI_KEY)

var util = require('../../util.js')

const engine_key = process.env.FIREBASE_KEY2
const engine_id = process.env.GCLOUD_ENGINE

//google image apis
var ImageUtils = function(client, cloudinary, translate) {
    var self = this

/*
 _____     ______     ______     ______   ______     __
/\  __-.  /\  ___\   /\  ___\   /\  == \ /\  __ \   /\ \
\ \ \/\ \ \ \  __\   \ \  __\   \ \  _-/ \ \  __ \  \ \ \
 \ \____-  \ \_____\  \ \_____\  \ \_\    \ \_\ \_\  \ \_\
  \/____/   \/_____/   \/_____/   \/_/     \/_/\/_/   \/_/
*/

    self.aipaint = (msg, ctx, config, cb) => {
        if (msg.attachments.size > 0) {
            var attachs = msg.attachments.array()
            for (var i = 0; i < attachs.length; i++) {
                ctx += " " + attachs[i].url
            }
        }
        if (msg.mentions && msg.mentions.users) {
            var users = msg.mentions.users.array().filter(u => u.id !== client.user.id)
            for (var i = 0; i < users.length; i++) {
                ctx += " " + users[i].displayAvatarURL({format:'png', size:2048, dynamic:true})
            }
        }

        if (!ctx || !ctx.trim()) return

        var params = ctx.trim().split(" ")

        for (var i = params.length - 1; i >= 0; i--) {
            if (params[i].startsWith("<@")) {
                params.splice(i,1)
            }
        }

        console.log(params)

        if (!params[0] || !params[1]) {
            cb("Please use provide two image URLs as parameters!")
            return
        }

        deepai.callStandardApi("neural-style", {
            style: params[0],
            content: params[1],
        })
        .then(res => {
            var url = res.output_url

            base64_request(url).then(function(data) {

                var imageStream = new Buffer.from(data, 'base64');
                var attachment = new Discord.MessageAttachment(imageStream, 'generated.png');

                var embed = new Discord.MessageEmbed()
                embed.attachFiles([attachment]);
                embed.setImage('attachment://generated.png');

                msg.channel.send(embed)
            })
        })
        .catch(err => cb("Please provide valid image URLs!"))
    }

    self.colorize = (msg, ctx, config, cb) => {
        if (msg.attachments.size > 0) {
            ctx = msg.attachments.array()[0].url
        }
        else if (msg.mentions && msg.mentions.users) {
            var users = msg.mentions.users.array()
            var user
            for (var i = 0; i < users.length; i++) {
                if (users[i].id !== client.user.id) user = users[i]
            }
            if (user) ctx = user.displayAvatarURL({format:'png', size:2048, dynamic:true})
        }

        if (!ctx || !ctx.trim()) return

        deepai.callStandardApi("colorizer", {
            image: ctx
        })
        .then(res => {
            var url = res.output_url
            base64_request(url).then(function(data) {

                var imageStream = new Buffer.from(data, 'base64');
                var attachment = new Discord.MessageAttachment(imageStream, 'generated.png');

                var embed = new Discord.MessageEmbed()
                embed.attachFiles([attachment]);
                embed.setImage('attachment://generated.png');

                msg.channel.send(embed)
            })
        })
        .catch(err => cb("Please provide a valid image URL!"))
    }

    self.enhance = (msg, ctx, config, cb) => {
        if (msg.attachments.size > 0) {
            ctx = msg.attachments.array()[0].url
        }
        else if (msg.mentions && msg.mentions.users) {
            var users = msg.mentions.users.array()
            var user
            for (var i = 0; i < users.length; i++) {
                if (users[i].id !== client.user.id) user = users[i]
            }
            if (user) ctx = user.displayAvatarURL({format:'png', size:2048, dynamic:true})
        }

        if (!ctx || !ctx.trim()) return

        deepai.callStandardApi("torch-srgan", {
            image: ctx
        })
        .then(res => {
            var url = res.output_url
            base64_request(url).then(function(data) {

                var imageStream = new Buffer.from(data, 'base64');
                var attachment = new Discord.MessageAttachment(imageStream, 'generated.png');

                var embed = new Discord.MessageEmbed()
                embed.attachFiles([attachment]);
                embed.setImage('attachment://generated.png');

                msg.channel.send(embed)
            })
        })
        .catch(err => cb("Please provide a valid image URL!"))
    }

    self.deepdream = (msg, ctx, config, cb) => {
        if (msg.attachments.size > 0) {
            ctx = msg.attachments.array()[0].url
        }
        else if (msg.mentions && msg.mentions.users) {
            var users = msg.mentions.users.array()
            var user
            for (var i = 0; i < users.length; i++) {
                if (users[i].id !== client.user.id) user = users[i]
            }
            if (user) ctx = user.displayAvatarURL({format:'png', size:2048, dynamic:true})
        }

        if (!ctx || !ctx.trim()) return

        deepai.callStandardApi("deepdream", {
            image: ctx
        })
        .then(res => {
            var url = res.output_url
            base64_request(url).then(function(data) {

                var imageStream = new Buffer.from(data, 'base64');
                var attachment = new Discord.MessageAttachment(imageStream, 'generated.png');

                var embed = new Discord.MessageEmbed()
                embed.attachFiles([attachment]);
                embed.setImage('attachment://generated.png');

                msg.channel.send(embed)
            })
        })
        .catch(err => cb("Please provide a valid image URL!"))
    }



/*
 ______     ______     ______     ______     __         ______
/\  ___\   /\  __ \   /\  __ \   /\  ___\   /\ \       /\  ___\
\ \ \__ \  \ \ \/\ \  \ \ \/\ \  \ \ \__ \  \ \ \____  \ \  __\
 \ \_____\  \ \_____\  \ \_____\  \ \_____\  \ \_____\  \ \_____\
  \/_____/   \/_____/   \/_____/   \/_____/   \/_____/   \/_____/
*/

    self.classify = (msg, ctx, config, cb) => {
        if (msg.attachments.size > 0) {
            ctx = msg.attachments.array()[0].url
        }
        else if (msg.mentions && msg.mentions.users) {
            var users = msg.mentions.users.array()
            var user
            for (var i = 0; i < users.length; i++) {
                if (users[i].id !== client.user.id) user = users[i]
            }
            if (user) ctx = user.displayAvatarURL({format:'png', size:2048, dynamic:true})
        }
        if (!ctx) {
            cb(msg.author.toString() + " Please include an image url!")
            return
        }
        base64_request(ctx).then(function(data) {
            var opts = {
                "requests": [{
                    "image":{
                        "content":data
                      },
                   "features": [
                        {
                         "type": "LABEL_DETECTION"
                        },
                    ]
                }]
            }
            request.post({
                headers: {'Content-Type': 'application/json'},
                url: "https://vision.googleapis.com/v1/images:annotate?key="+process.env.FIREBASE_KEY2,
                body: JSON.stringify(opts)
            }, function(err, response, body) {
                if (err) {
                    cb(msg.author.toString() + " Invalid image url!")
                    return
                }
                var embed = new Discord.MessageEmbed()
                //embed.setTitle("Prediction")
                embed.setThumbnail(ctx)

                var labels = JSON.parse(body).responses[0].labelAnnotations

                if (!labels) {
                    cb(msg.author.toString() + " I couldn't recognize anything from that!")
                    return
                }

                var desc = ""
                for (var i = 0; i < labels.length; i++) {
                    desc += Math.round(labels[i].score * 100) + "% **" + labels[i].description + "**\n"
                }
                embed.setDescription(desc)
                msg.channel.send(embed).then().catch(function(error){console.error(error)})
            });

        }).catch(error => {
            cb(msg.author.toString() + " Invalid image url!")
        })
    }

    self.describe = (msg, ctx, config, cb) => {
        if (msg.attachments.size > 0) {
            ctx = msg.attachments.array()[0].url
        }
        else if (msg.mentions && msg.mentions.users) {
            var users = msg.mentions.users.array()
            var user
            for (var i = 0; i < users.length; i++) {
                if (users[i].id !== client.user.id) user = users[i]
            }
            if (user) ctx = user.displayAvatarURL({format:'png', size:2048, dynamic:true})
        }
        if (!ctx) {
            cb(msg.author.toString() + " Please include an image url!")
            return
        }
        base64_request(ctx).then(function(data) {
            var opts = {
                "requests": [{
                    "image":{
                        "content":data
                      },
                    "imageContext": {
                        "webDetectionParams": {
                          "includeGeoResults": true
                         }
                      },
                   "features": [
                        {
                         "type": "WEB_DETECTION"
                        },
                    ]
                }]
            }
            request.post({
                headers: {'Content-Type': 'application/json'},
                url: "https://vision.googleapis.com/v1/images:annotate?key="+process.env.FIREBASE_KEY2,
                body: JSON.stringify(opts)
            }, function(err, response, body) {
                if (err) {
                    cb(msg.author.toString() + " Invalid image url!")
                    return
                }
                var embed = new Discord.MessageEmbed()
                //embed.setTitle("Describe")
                embed.setThumbnail(ctx)

                var detect = JSON.parse(body).responses[0].webDetection

                if (!detect) {
                    cb(msg.author.toString() + " I couldn't recognize anything from that!")
                    return
                }

                var labels = detect.webEntities

                if (!labels) {
                    cb(msg.author.toString() + " I couldn't recognize anything from that!")
                    return
                }

                var desc = ""
                for (var i = 0; i < labels.length; i++) {
                    if (labels[i].description != undefined) desc += labels[i].description + "\n"
                }
                embed.setDescription(desc)
                msg.channel.send(embed).then().catch(function(error){console.error(error)})
            });

        }).catch(error => {
            cb(msg.author.toString() + " Invalid image url!")
        })
    }

    self.identify = (msg, ctx, config, cb) => {
        if (msg.attachments.size > 0) {
            ctx = msg.attachments.first().url
        }
        else if (msg.mentions && msg.mentions.users) {
            var users = msg.mentions.users.array()
            var user
            for (var i = 0; i < users.length; i++) {
                if (users[i].id !== client.user.id) user = users[i]
            }
            if (user) ctx = user.displayAvatarURL({format:'png', size:2048, dynamic:true})
        }
        if (!ctx) {
            cb(msg.author.toString() + " Please include an image url!")
            return
        }
        base64_request(ctx).then(function(data) {
            var opts = {
                "requests": [{
                    "image":{
                        "content":data
                      },
                   "features": [
                        {
                         "type": "WEB_DETECTION"
                        },
                    ]
                }]
            }
            request.post({
                headers: {'Content-Type': 'application/json'},
                url: "https://vision.googleapis.com/v1/images:annotate?key="+process.env.FIREBASE_KEY2,
                body: JSON.stringify(opts)
            }, function(err, response, body) {
                if (err) {
                    cb(msg.author.toString() + " Invalid image url!")
                    return
                }
                var embed = new Discord.MessageEmbed()
                embed.setThumbnail(ctx)

                var pa = JSON.parse(body)
                if (pa && pa.responses && pa.responses[0] && pa.responses[0].webDetection) {
                    var res = pa.responses[0].webDetection.bestGuessLabels[0].label
                    embed.setTitle(res)
                    msg.channel.send(embed).then().catch(function(error){console.error(error)})
                } else cb("I couldn't understand that image!")
            });

        }).catch(error => {
            cb(msg.author.toString() + " Invalid image url!")
        })
    }

    self.landmark = (msg, ctx, config, cb) => {
        if (msg.attachments.size > 0) {
            ctx = msg.attachments.array()[0].url
        }
        else if (msg.mentions && msg.mentions.users) {
            var users = msg.mentions.users.array()
            var user
            for (var i = 0; i < users.length; i++) {
                if (users[i].id !== client.user.id) user = users[i]
            }
            if (user) ctx = user.displayAvatarURL({format:'png', size:2048, dynamic:true})
        }
        if (!ctx) {
            cb(msg.author.toString() + " Please include an image url!")
            return
        }
        base64_request(ctx).then(function(data) {
            var opts = {
                "requests": [{
                    "image":{
                        "content":data
                      },
                   "features": [
                        {
                         "type": "LANDMARK_DETECTION"
                        },
                    ]
                }]
            }

            request.post({
                headers: {'Content-Type': 'application/json'},
                url: "https://vision.googleapis.com/v1/images:annotate?key="+process.env.FIREBASE_KEY2,
                body: JSON.stringify(opts)
            }, function(err, response, body) {
                if (err) {
                    cb(msg.author.toString() + " Invalid image url!")
                    return
                }
                var embed = new Discord.MessageEmbed()
                embed.setThumbnail(ctx)

                var pa = JSON.parse(body)
                if (pa && pa.responses && pa.responses[0]) {
                    var loc = pa.responses[0].landmarkAnnotations
                    if (loc) {
                        embed.addField("Location",loc[0].description)
                        embed.addField("Latitude","`"+loc[0].locations[0].latLng.latitude+"`")
                        embed.addField("Longitude","`"+loc[0].locations[0].latLng.longitude+"`")
                    }

                    if (embed.fields.length == 0) cb("I couldn't put that on the map!")
                    else msg.channel.send(embed).then().catch(function(error){console.error(error)})

                } else cb("I couldn't put that on the map!")
            });

        }).catch(error => {
            cb(msg.author.toString() + " Invalid image url!")
        })
    }

    self.locate = (msg, ctx, config, cb) => {
        if (msg.attachments.size > 0) {
            ctx = msg.attachments.array()[0].url
        }
        else if (msg.mentions && msg.mentions.users) {
            var users = msg.mentions.users.array()
            var user
            for (var i = 0; i < users.length; i++) {
                if (users[i].id !== client.user.id) user = users[i]
            }
            if (user) ctx = user.displayAvatarURL({format:'png', size:2048, dynamic:true})
        }
        if (!ctx) {
            cb(msg.author.toString() + " Please include an image url!")
            return
        }
        base64_request(ctx).then(function(data) {
            var opts = {
                "requests": [{
                    "image":{
                        "content":data
                      },
                   "features": [
                        {
                         "type": "WEB_DETECTION"
                        },
                    ]
                }]
            }
            request.post({
                headers: {'Content-Type': 'application/json'},
                url: "https://vision.googleapis.com/v1/images:annotate?key="+process.env.FIREBASE_KEY2,
                body: JSON.stringify(opts)
            }, function(err, response, body) {
                if (err) {
                    cb(msg.author.toString() + " Invalid image url!")
                    return
                }
                var embed = new Discord.MessageEmbed()
                embed.setTitle("Found On")
                embed.setThumbnail(ctx)

                var pa = JSON.parse(body)
                if (pa && pa.responses && pa.responses[0] && pa.responses[0].webDetection) {
                    var detect = pa.responses[0].webDetection
                    if (!detect.pagesWithMatchingImages) {
                        cb("Couldn't find that anywhere online!")
                        return
                    }
                    embed.setFooter(detect.pagesWithMatchingImages.length + "+ reposts")
                    var res = detect.pagesWithMatchingImages.slice(0,10)
                    var desc = ""
                    for (var i = 0; i < res.length; i++) {
                        desc += "["+res[i].pageTitle.replace(/<[^>]+>/g, '')+"]("+res[i].url+")\n"
                    }
                    embed.setDescription(desc)
                    msg.channel.send(embed).then().catch(function(error){console.error(error)})
                } else cb("I couldn't understand that image!")
            });

        }).catch(error => {
            cb(msg.author.toString() + " Invalid image url!")
        })
    }

    self.similar = (msg, ctx, config, cb) => {
        if (msg.attachments.size > 0) {
            ctx = msg.attachments.array()[0].url
        }
        else if (msg.mentions && msg.mentions.users) {
            var users = msg.mentions.users.array()
            var user
            for (var i = 0; i < users.length; i++) {
                if (users[i].id !== client.user.id) user = users[i]
            }
            if (user) ctx = user.displayAvatarURL({format:'png', size:2048, dynamic:true})
        }
        if (!ctx) {
            cb(msg.author.toString() + " Please include an image url!")
            return
        }
        base64_request(ctx).then(function(data) {
            var opts = {
                "requests": [{
                    "image":{
                        "content":data
                      },
                   "features": [
                        {
                         "type": "WEB_DETECTION"
                        },
                    ]
                }]
            }
            request.post({
                headers: {'Content-Type': 'application/json'},
                url: "https://vision.googleapis.com/v1/images:annotate?key="+process.env.FIREBASE_KEY2,
                body: JSON.stringify(opts)
            }, function(err, response, body) {
                if (err) {
                    cb(msg.author.toString() + " Invalid image url!")
                    return
                }
                var embed = new Discord.MessageEmbed()
                embed.setThumbnail(ctx)
                embed.setTitle("Similar Image")

                var pa = JSON.parse(body)
                if (pa && pa.responses && pa.responses[0] && pa.responses[0].webDetection) {
                    var detect = pa.responses[0].webDetection
                    var res = detect.visuallySimilarImages || detect.partialMatchingImages || detect.fullMatchingImages
                    var mirror = res[Math.floor(Math.random()*res.length)].url;
                    embed.setImage(mirror)
                    msg.channel.send(embed).then().catch(function(error){console.error(error)})
                } else cb("I couldn't understand that image!")
            });

        }).catch(error => {
            cb(msg.author.toString() + " Invalid image url!")
        })
    }
    //self.mirror = self.similar

    self.mirror = (msg, ctx, config, cb) => {
        if (msg.attachments.size > 0) {
            ctx = msg.attachments.array()[0].url
        }
        else if (msg.mentions && msg.mentions.users) {
            var users = msg.mentions.users.array()
            var user
            for (var i = 0; i < users.length; i++) {
                if (users[i].id !== client.user.id) user = users[i]
            }
            if (user) ctx = user.displayAvatarURL({format:'png', size:2048, dynamic:true})
        }
        if (!ctx) {
            cb(msg.author.toString() + " Please include an image url!")
            return
        }

        base64_request(ctx).then(function(data) {
            var opts = {
                "requests": [{
                    "image":{
                        "content":data
                      },
                   "features": [
                        {
                         "type": "WEB_DETECTION"
                        },
                    ]
                }]
            }

            request.post({
                headers: {'Content-Type': 'application/json'},
                url: "https://vision.googleapis.com/v1/images:annotate?key="+process.env.FIREBASE_KEY2,
                body: JSON.stringify(opts)
            }, function(err, response, body) {
                if (err) {
                    cb(msg.author.toString() + " Invalid image url!")
                    return
                }
                var embed = new Discord.MessageEmbed()
                embed.setThumbnail(ctx)
                embed.setTitle("Nearest Match")

                var pa = JSON.parse(body)
                if (pa && pa.responses && pa.responses[0] && pa.responses[0].webDetection) {
                    var detect = pa.responses[0].webDetection
                    var res = detect.fullMatchingImages || detect.partialMatchingImages || detect.visuallySimilarImages
                    if (!res || !res[0]) {
                        cb("No matching images!")
                    }

                    var mirror = res[0].url;
                    embed.setImage(mirror)
                    msg.channel.send(embed).then().catch(function(error){console.error(error)})
                } else cb("I couldn't understand that image!")
            });

        }).catch(error => {
            cb(msg.author.toString() + " Invalid image url!")
        })
    }

    self.read = (msg, ctx, config, cb) => {
        if (msg.attachments.size > 0) {
            ctx = msg.attachments.array()[0].url
        }
        else if (msg.mentions && msg.mentions.users) {
            var users = msg.mentions.users.array()
            var user
            for (var i = 0; i < users.length; i++) {
                if (users[i].id !== client.user.id) user = users[i]
            }
            if (user) ctx = user.displayAvatarURL({format:'png', size:2048, dynamic:true})
        }
        if (!ctx) {
            cb(msg.author.toString() + " Please include an image url!")
            return
        }
        base64_request(ctx).then(function(data) {
            var opts = {
                "requests": [{
                    "image":{
                        "content":data
                      },
                   "features": [
                        {
                         "type": "DOCUMENT_TEXT_DETECTION"
                        },
                    ]
                }]
            }
            request.post({
                headers: {'Content-Type': 'application/json'},
                url: "https://vision.googleapis.com/v1/images:annotate?key="+process.env.FIREBASE_KEY2,
                body: JSON.stringify(opts)
            }, function(err, response, body) {
                if (err) {
                    cb(msg.author.toString() + " Invalid image url!")
                    return
                }
                var embed = new Discord.MessageEmbed()
                embed.setTitle("Text Grab")
                embed.setThumbnail(ctx)

                var labels = JSON.parse(body).responses[0].textAnnotations

                if (!labels) {
                    cb(msg.author.toString() + " I couldn't recognize anything from that!")
                    return
                }

                var desc = labels[0].description.slice(0,1000)
                /*
                embed.setDescription(desc)
                if (!raw) {
                    msg.channel.send(embed).then().catch(function(error){console.error(error)})
                }*/
                msg.reply("```"+desc+"```").then().catch(function(error){console.error(error)})
            });

        }).catch(error => {
            cb(msg.author.toString() + " Invalid image url!")
        })
    }

    self.imgtranslate = (msg, ctx, config, cb) => {
        if (!ctx.trim()) {
            cb(msg.author.toString() + " Please include an image url!")
            return
        }

        var params = ctx.trim().split(" ")

        if (params.length < 2) {
            cb("Please include a target language and image URL!\n`@whiskers imgtranslate [language (e.g. en)] [image URL]`")
            return
        }

        var lang = params[0]
        var img_url = params[1]

        base64_request(img_url).then(function(data) {
            var opts = {
                "requests": [{
                    "image":{
                        "content":data
                      },
                   "features": [
                        {
                         "type": "DOCUMENT_TEXT_DETECTION"
                        },
                    ]
                }]
            }
            request.post({
                headers: {'Content-Type': 'application/json'},
                url: "https://vision.googleapis.com/v1/images:annotate?key="+process.env.FIREBASE_KEY2,
                body: JSON.stringify(opts)
            }, function(err, response, body) {
                if (err) {
                    cb(msg.author.toString() + " Invalid image url!")
                    return
                }
                var embed = new Discord.MessageEmbed()
                embed.setTitle("Text Grab")
                embed.setThumbnail(ctx)

                var labels = JSON.parse(body).responses[0].textAnnotations

                if (!labels) {
                    cb(msg.author.toString() + " I couldn't recognize anything from that!")
                    return
                }

                var desc = labels[0].description.slice(0,1000)

                translate.translate(desc, { to: lang }, function(err, res) {
                  if (err) msg.reply("Yandex Error: " + err)
                  else if (res.text) {
                      msg.reply("`"+res.text+"`").then().catch(function(error){console.error(error)})
                  }
                  else cb(msg.author.toString() + " language not recognized.\nHere's the full list: https://tech.yandex.com/translate/doc/dg/concepts/api-overview-docpage/#api-overview__languages")
                });
            });

        }).catch(error => {
            cb(msg.author.toString() + " Invalid image url!")
        })

    }

    self.funny = (msg, ctx, config, cb) => {
        if (msg.attachments.size > 0) {
            ctx = msg.attachments.array()[0].url
        }
        else if (msg.mentions && msg.mentions.users) {
            var users = msg.mentions.users.array()
            var user
            for (var i = 0; i < users.length; i++) {
                if (users[i].id !== client.user.id) user = users[i]
            }
            if (user) ctx = user.displayAvatarURL({format:'png', size:2048, dynamic:true})
        }
        if (!ctx) {
            cb(msg.author.toString() + " Please include an image url!")
            return
        }
        base64_request(ctx).then(function(data) {
            var opts = {
                "requests": [{
                    "image":{
                        "content":data
                      },
                   "features": [
                        {
                         "type": "SAFE_SEARCH_DETECTION"
                        },
                    ]
                }]
            }
                request.post({
                    headers: {'Content-Type': 'application/json'},
                    url: "https://vision.googleapis.com/v1/images:annotate?key="+process.env.FIREBASE_KEY2,
                    body: JSON.stringify(opts)
                }, function(err, response, body) {
                    if (err) {
                        cb(msg.author.toString() + " Invalid image url!")
                        return
                    }
                    var embed = new Discord.MessageEmbed()
                    embed.setThumbnail(ctx)

                    var labels = JSON.parse(body).responses[0].safeSearchAnnotation

                    if (!labels) {
                        cb(msg.author.toString() + " I couldn't recognize anything from that!")
                        return
                    }

                    var spoof = labels.spoof
                    switch(spoof) {
                        case "UNKNOWN":
                            embed.setColor('BLACK')
                            embed.setTitle("??? 🗿")
                            break;
                        case "VERY_UNLIKELY":
                            embed.setColor('RED')
                            embed.setTitle("Gumwaa 😢")
                            break;
                        case "UNLIKELY":
                            embed.setColor('ORANGE')
                            embed.setTitle("Unfunny 😕")
                            break;
                        case "POSSIBLE":
                            embed.setColor('#ffd000')
                            embed.setTitle("Kinda funny 🙂")
                            break;
                        case "LIKELY":
                            embed.setColor('GREEN')
                            embed.setTitle("Funny 😃")
                            break;
                        case "VERY_LIKELY":
                            embed.setColor('BLUE')
                            embed.setTitle("Funwaa 😂")
                            break;
                        default:
                            embed.setColor('BLACK')
                            embed.setTitle("??? 🗿")
                            break;
                    }

                    msg.channel.send(embed).catch(function(error){console.error(error)})
                });

        }).catch(error => {
            cb(msg.author.toString() + " Invalid image url!")
        })
    }

    self.soy = (msg, ctx, config, cb) => {
        if (msg.attachments.size > 0) {
            ctx = msg.attachments.array()[0].url
        }
        else if (msg.mentions && msg.mentions.users) {
            var users = msg.mentions.users.array()
            var user
            for (var i = 0; i < users.length; i++) {
                if (users[i].id !== client.user.id) user = users[i]
            }
            if (user) ctx = user.displayAvatarURL({format:'png', size:2048, dynamic:true})
        }
        if (!ctx) {
            cb(msg.author.toString() + " Please include an image url!")
            return
        }
        var metrics = [
            ["Face", "Head"],
            ["Forehead", "Nose", "Chin", "Eyebrow", "Tooth", "Jaw", "Mouth"],
            ["Product", "Design"],
            ["Electronics", "Electronic device"],
            ["Photography", "Selfie"],
            ["Facial expression"],
            ["Beard","Facial hair", "Moustache"],
            ["Happy", "Fun", "Smile"],
            ["Glasses", "Eyewear"]
        ] //ranked by index

        base64_request(ctx).then(function(data) {
            var opts = {
                "requests": [{
                    "image":{
                        "content":data
                      },
                   "features": [
                        {
                         "type": "LABEL_DETECTION"
                        },
                    ]
                }]
            }

            request.post({
                headers: {'Content-Type': 'application/json'},
                url: "https://vision.googleapis.com/v1/images:annotate?key="+process.env.FIREBASE_KEY2,
                body: JSON.stringify(opts)
                }, function(err, response, body) {
                    if (err) {
                        cb(msg.author.toString() + " Invalid image url!")
                        return
                    }
                    var embed = new Discord.MessageEmbed()
                    //embed.setTitle("Prediction")
                    embed.setThumbnail(ctx)

                    var labels = JSON.parse(body).responses[0].labelAnnotations

                    if (!labels) {
                        cb(msg.author.toString() + " I couldn't recognize anything from that!")
                        return
                    }

                    var score = 0;

                    if (labels.find(l => l.description.includes("Soy"))) score = "TOO MUCH SOY";
                    else {
                        for (var i = 0; i < metrics.length; i++) {
                            var match = labels.find(l => metrics[i].indexOf(l.description) !== -1)

                            if (match) {
                                if (score == 0) score = 1
                                score *= i + match.score
                            }
                        }
                        score = (score + 0.5) << 0
                        score += "g of soy"
                    }

                    embed.setTitle(score)
                    msg.channel.send(embed)
                });
            }).catch(error => {
                cb(msg.author.toString() + " Invalid image url!")
            })
    }

    self.mood = (msg, ctx, config, cb) => {
        if (msg.attachments.size > 0) {
            ctx = msg.attachments.array()[0].url
        }
        else if (msg.mentions && msg.mentions.users) {
            var users = msg.mentions.users.array()
            var user
            for (var i = 0; i < users.length; i++) {
                if (users[i].id !== client.user.id) user = users[i]
            }
            if (user) ctx = user.displayAvatarURL({format:'png', size:2048, dynamic:true})
        }
        if (!ctx) {
            cb(msg.author.toString() + " Please include an image url!")
            return
        }
        base64_request(ctx).then(function(data) {
            var opts = {
                "requests": [{
                    "image":{
                        "content":data
                      },
                   "features": [
                        {
                         "type": "FACE_DETECTION"
                        },
                    ]
                }]
            }
            request.post({
                headers: {'Content-Type': 'application/json'},
                url: "https://vision.googleapis.com/v1/images:annotate?key="+process.env.FIREBASE_KEY2,
                body: JSON.stringify(opts)
            }, function(err, response, body) {

                if (err) {
                    cb(msg.author.toString() + " Invalid image url!")
                    return
                }

                var embed = new Discord.MessageEmbed()
                embed.setThumbnail(ctx)

                var res = JSON.parse(body)

                var labels = JSON.parse(body).responses[0].faceAnnotations

                if (!labels) {

                    cb(msg.author.toString() + " I couldn't recognize a human face from that!")
                    return
                }

                labels = labels[0]

                var emotions = ["joyLikelihood", "sorrowLikelihood", "angerLikelihood", "surpriseLikelihood"]
                var emotion_emojis = ["😄","😔","😠","😲"]

                var title = ""
                for (var i = 0; i < emotions.length; i++) {
                    if (labels[emotions[i]] == 'VERY_LIKELY' || labels[emotions[i]] == 'LIKELY' || labels[emotions[i]] == 'POSSIBLE') {
                        title += emotion_emojis[i] + " "
                    }
                }
                embed.setTitle(title ? title : "Just vibin'")

                msg.channel.send(embed).then().catch(function(error){console.error(error)})
            })
        }).catch(error => {
            cb(msg.author.toString() + " Invalid image url!")
        })
    }

    self.nsfw_test = (msg, ctx, config, cb) => {

        if (msg.attachments.size > 0) {
            ctx = msg.attachments.array()[0].url
        }
        else if (msg.mentions && msg.mentions.users) {
            var users = msg.mentions.users.array()
            var user
            for (var i = 0; i < users.length; i++) {
                if (users[i].id !== client.user.id) user = users[i]
            }
            if (user) ctx = user.displayAvatarURL({format:'png', size:2048, dynamic:true})
        }
        if (!ctx) {
            cb(msg.author.toString() + " Please include an image url!")
            return
        }

        base64_request(ctx).then(function(data) {
            var opts = {
                "requests": [{
                    "image":{
                        "content":data
                      },
                   "features": [
                        {
                         "type": "SAFE_SEARCH_DETECTION"
                        },
                    ]
                }]
            }

            request.post({
                headers: {'Content-Type': 'application/json'},
                url: "https://vision.googleapis.com/v1/images:annotate?key="+process.env.FIREBASE_KEY2,
                body: JSON.stringify(opts)
            }, function(err, response, body) {
                if (err) {
                    cb(msg.author.toString() + " Invalid image url!")
                    return
                }
                var embed = new Discord.MessageEmbed()
                embed.setThumbnail(ctx)

                var labels = JSON.parse(body).responses[0].safeSearchAnnotation

                if (!labels) {
                    cb(msg.author.toString() + " I couldn't recognize anything from that!")
                    return
                }

                embed.addField("Adult",labels.adult)
                embed.addField("Medical", labels.medical)
                embed.addField("Violence", labels.violence)
                embed.addField("Racy", labels.racy)

                msg.channel.send(embed).catch(function(error){console.error(error)})
            });

        }).catch(error => {
            cb(msg.author.toString() + " Invalid image url!")
        })

    }

    self.img = (msg, ctx, config, cb) => {

        if (!ctx || !ctx.trim()) return

        ctx = ctx.slice(0,128)
        var query = encodeURIComponent(ctx)

        request(
            {
                url: `https://api.imgur.com/3/gallery/search/viral/?q=${query}`,
                headers : { "Authorization" : `Client-ID 3895404d8f60cfd` }
            },
            function(err, req, res) {
                if (err) {
                    cb("Sorry, Imgur is down!")
                    return
                }

                var out
                try {
                    out = JSON.parse(res)
                }
                catch(e) {
                    cb("Sorry, Imgur is down!")
                    return
                }

                var data = out.data

                if (data.length == 0) {
                    cb('No results!')
                    return
                }

                data = data.filter(d =>  d.images != undefined && d.images.length > 0)

                if (data.length == 0) {
                    cb('No results!')
                    return
                }

                var album = data[Math.floor(Math.random() * data.length)]

                var img = album.images[Math.floor(Math.random() * album.images.length)]

                if (img.link.endsWith('mp4') || img.link.endsWith('gifv')) {
                    msg.channel.send(img.link)
                    return
                }

                var embed = new Discord.MessageEmbed()
                embed.setTitle(img.title || ctx)
                embed.setURL(album.link)
                embed.setImage(img.link)
                embed.setFooter(`'${ctx}'`)

                msg.channel.send(embed)
            }
        )
    }



/*
 __    __     ______     __    __     ______
/\ "-./  \   /\  ___\   /\ "-./  \   /\  ___\
\ \ \-./\ \  \ \  __\   \ \ \-./\ \  \ \  __\
 \ \_\ \ \_\  \ \_____\  \ \_\ \ \_\  \ \_____\
  \/_/  \/_/   \/_____/   \/_/  \/_/   \/_____/

*/

    //same as inspire but with custom captions
    self.demotivate = (msg, ctx, config, cb) => {

        if (!ctx.trim()) return

        var top = ""
        var bottom = ""

        var params = ctx.trim().split(" ")

        if (!params[0] || !util.isImageURL(params[0])) {
            cb("Please use a valid image URL!")
            return
        }

        if (params.length < 2) {
            cb("Please include both an image and caption!\n`@whiskers demotivate [image URL] [top text|bottom text]`")
            return
        }

        params = [params[0], params.slice(1).join(" ")]

        var img_url = params[0]

        var top = params[1]

        if (top.includes('|')) {
    		var split = top.split('|')
    		top = split[0]
    		bottom = split[1]
        }

        var fontSize,fontSize2

        if (top.length > 0) {
            top = top.toUpperCase()
            fontSize =  (90*25) / top.length
            if (fontSize > 120) fontSize = 120
        }

        fontSize2 = 50

        var rand_id = Math.random().toString(36).substring(4)

        cloudinary.uploader.upload(img_url, //upload the image to cloudinary
          function(result) {

            bottom = encodeURIComponent(util.stripEmojis(bottom.replace(/\n/g," ").replace(/\//g,'').replace(/,/g,'')))
            top = encodeURIComponent(util.stripEmojis(top.replace(/\n/g," ").replace(/\//g,'').replace(/,/g,'')))

            var url = `https://res.cloudinary.com/dbfjrdqyp/image/upload/c_scale,h_616,q_100,w_1095/l_demotivational_poster_xxq1ss,g_north,y_-120`

            if (top.length > 0) url += `/w_1330,c_lpad,l_text:Times_${fontSize}_letter_spacing_5:${top},y_320,co_rgb:FFFFFF`
            if (bottom.length > 0) url += `/w_1330,c_lpad,l_text:Times_${fontSize2}_center:${bottom},y_430,co_rgb:FFFFFF`

            url += "/"+rand_id

            base64_request(url).then(function(data) {

                var imageStream = new Buffer.from(data, 'base64');
                var attachment = new Discord.MessageAttachment(imageStream, 'generated.png');

                var embed = new Discord.MessageEmbed()
                embed.attachFiles([attachment]);
                embed.setImage('attachment://generated.png');

                msg.channel.send(embed).then(function() { //upload buffer to discord
                    cloudinary.uploader.destroy(rand_id, function(result) {  }); //delete cloudinary image
                })
            })
          },
          {public_id: rand_id}
        )
    }

    self.inspire2 = (msg, ctx, config, cb) => {

        if (msg.attachments.size > 0) {
            ctx = msg.attachments.first().url
        }
        else if (msg.mentions && msg.mentions.users) {
            var users = msg.mentions.users.array()
            var user
            for (var i = 0; i < users.length; i++) {
                if (users[i].id !== client.user.id) user = users[i]
            }
            if (user) ctx = user.displayAvatarURL({format:'png', size:2048, dynamic:true})
        }

        if (!ctx.trim()) return
        ctx = ctx.trim()

        if (!util.isImageURL(ctx)) {
            cb("Please use a valid image URL!")
            return
        }

        var top = ""
        var bottom = ""

        base64_request(ctx).then(function(data) { //get image identification
            var opts = {
                "requests": [{
                    "image":{
                        "content":data
                      },
                   "features": [
                        {
                         "type": "WEB_DETECTION"
                        },
                    ]
                }]
            }
            request.post({
                headers: {'Content-Type': 'application/json'},
                url: "https://vision.googleapis.com/v1/images:annotate?key="+process.env.FIREBASE_KEY2,
                body: JSON.stringify(opts)
            }, function(err, response, body) {
                if (err) {
                    cb(msg.author.toString() + " Invalid image url!")
                    return
                }

                var pa = JSON.parse(body)
                if (pa && pa.responses && pa.responses[0] && pa.responses[0].webDetection) {

                    //var searchQ = "meme" // /r/copypasta search query
                    if (!pa.responses[0] || !pa.responses[0].webDetection || !pa.responses[0].webDetection.bestGuessLabels[0].label) top = "MEME"
                    else {
                        top = pa.responses[0].webDetection.bestGuessLabels[0].label.toUpperCase()
                    }

                    var labels = pa.responses[0].webDetection.webEntities

                    generateCaption(labels, Math.random() <= 0.5 ? "comedyheaven" : "okbuddyretard", function(caption) {

                        if (caption == "REDDIT IS DOWN") {
                            cb("Sorry, reddit's API is down and I can't generate any captions!")
                            return
                        }

                        bottom = caption

                        top = encodeURI(util.stripEmojis(top.replace(/\//g,'').replace(/,/g,'')))

                        var meme_url = `https://memegen.link/custom/${top}`

                        bottom = encodeURI(util.stripEmojis(bottom.replace(/\//g,'').replace(/,/g,'')))

                        meme_url += `/${bottom}.jpg`

                        meme_url += `?alt=${encodeURI(ctx)}&font=impact`
                        console.log(meme_url)
                        base64_request(meme_url).then(function(data) {

                            var imageStream = new Buffer.from(data, 'base64');
                            var attachment = new Discord.MessageAttachment(imageStream, 'generated.png');

                            var embed = new Discord.MessageEmbed()
                            embed.attachFiles([attachment]);
                            embed.setImage('attachment://generated.png');

                            msg.channel.send(embed).catch(console.error)
                        })
                    })


                } else cb("I couldn't understand that image!")
            });

        }).catch(error => {
            cb(msg.author.toString() + " Invalid image url!")
        })
    }

    self.inspire = (msg, ctx, config, cb) => {

        if (msg.attachments.size > 0) {
            ctx = msg.attachments.first().url
        }
        else if (msg.mentions && msg.mentions.users) {
            var users = msg.mentions.users.array()
            var user
            for (var i = 0; i < users.length; i++) {
                if (users[i].id !== client.user.id) user = users[i]
            }
            if (user) ctx = user.displayAvatarURL({format:'png', size:2048, dynamic:true})
        }

        if (!ctx.trim()) return
        ctx = ctx.trim()

        var top = ""
        var bottom = ""
        var guess = ""

        base64_request(ctx).then(function(data) { //get image identification
            var opts = {
                "requests": [{
                    "image":{
                        "content":data
                      },
                   "features": [
                        {
                         "type": "WEB_DETECTION"
                        },
                    ]
                }]
            }
            request.post({
                headers: {'Content-Type': 'application/json'},
                url: "https://vision.googleapis.com/v1/images:annotate?key="+process.env.FIREBASE_KEY2,
                body: JSON.stringify(opts)
            }, function(err, response, body) {
                if (err) {
                    cb(msg.author.toString() + " Invalid image url!")
                    return
                }

                var pa = JSON.parse(body)
                if (pa && pa.responses && pa.responses[0] && pa.responses[0].webDetection) {

                    //var searchQ = "meme" // /r/copypasta search query
                    if (!pa.responses[0] || !pa.responses[0].webDetection || !pa.responses[0].webDetection.bestGuessLabels[0].label) top = "MEME"
                    else {
                        guess = pa.responses[0].webDetection.bestGuessLabels[0].label
                    }

                    var labels = pa.responses[0].webDetection.webEntities
                    if (!labels) labels = []
                    labels.push({description:guess})

                    var sub = "bruhmoment"
                    var rando = Math.random()
                    if (rando < 0.4) sub = "comedyheaven"
                    else if (rando < 0.8) sub = "okbuddyretard"

                    generateCaption(labels, sub, function(caption) { //bottom caption

                        if (caption == "REDDIT IS DOWN") {
                            cb("Sorry, reddit's API is down and I can't generate any captions!")
                            return
                        }

                        //labels.push({description:guess})
                        //generateCaption(labels, "okbuddyretard", function(caption2) { //top caption
                        bottom = caption

                        //if (caption2 == "funny image") {
                        top = guess.toUpperCase()
                        //}
                        //else {
                        //    top = caption2.toUpperCase().split(" ").slice(0,5).join(" ")

                        //}
                        var rand_id = Math.random().toString(36).substring(4)

                        cloudinary.uploader.upload(ctx, //upload the image to cloudinary
                          function(result) {

                            var fontSize, fontSize2

                            top = encodeURIComponent(util.stripEmojis(top.replace(/\//g,'').replace(/,/g,'')))

                            fontSize =  (90*25) / top.length
                            if (fontSize > 120) fontSize = 120

                            var url = `https://res.cloudinary.com/dbfjrdqyp/image/upload/c_scale,h_616,q_100,w_1095/l_demotivational_poster_xxq1ss,g_north,y_-120/w_1330,c_lpad,l_text:Times_${fontSize}_letter_spacing_5:${top},y_320,co_rgb:FFFFFF`

                            if (bottom.length > 0) {
                                fontSize2 = 50

                                bottom = bottom.replace(/\n/g, ' ')

                                if (bottom.length > 100) {
                                    bottom = bottom.slice(0,bottom.length/2) + "\n" + bottom.slice(bottom.length/2)
                                }


                                bottom = encodeURIComponent(util.stripEmojis(bottom.replace(/\//g,'').replace(/,/g,'')))

                                url += `/w_1300,c_lpad,l_text:Times_${fontSize2}_center:${bottom},y_430,co_rgb:FFFFFF`
                            }

                            url += "/"+rand_id

                            base64_request(url).then(function(data) {

                                var imageStream = new Buffer.from(data, 'base64');
                                var attachment = new Discord.MessageAttachment(imageStream, 'generated.png');

                                var embed = new Discord.MessageEmbed()
                                embed.attachFiles([attachment]);
                                embed.setImage('attachment://generated.png');

                                msg.channel.send(embed).then(function() { //upload buffer to discord
                                    cloudinary.uploader.destroy(rand_id, function(result) {  }); //delete cloudinary image
                                })
                            })
                            /*
                            download(url, './'+rand_id+'.png', function() { //download image locally

                                msg.channel.send({files: ['./'+rand_id+'.png']}).then(function() { //upload local image to discord
                                    fs.unlinkSync('./'+rand_id+'.png'); //delete local image
                                    cloudinary.uploader.destroy(rand_id, function(result) {  }); //delete cloudinary image
                                })
                            });
                            */
                          },
                          {public_id: rand_id}
                        )
                        //})
                    })


                } else cb("I couldn't understand that image!")
            });

        }).catch(error => {
            cb(msg.author.toString() + " Invalid image url!")
        })
    }

    self.inspire_quote = (msg, ctx, config, cb) => {

        if (msg.attachments.size > 0) {
            ctx = msg.attachments.array()[0].url
        }
        else if (msg.mentions && msg.mentions.users) {
            var users = msg.mentions.users.array()
            var user
            for (var i = 0; i < users.length; i++) {
                if (users[i].id !== client.user.id) user = users[i]
            }
            if (user) ctx = user.displayAvatarURL({format:'png', size:2048, dynamic:true})
        }


        if (!ctx.trim()) return
        ctx = ctx.trim()

        var top = ""
        var bottom = ""

        base64_request(ctx).then(function(data) { //get image identification
            var opts = {
                "requests": [{
                    "image":{
                        "content":data
                      },
                   "features": [
                        {
                         "type": "WEB_DETECTION"
                        },
                    ]
                }]
            }
            request.post({
                headers: {'Content-Type': 'application/json'},
                url: "https://vision.googleapis.com/v1/images:annotate?key="+process.env.FIREBASE_KEY2,
                body: JSON.stringify(opts)
            }, function(err, response, body) {
                if (err) {
                    cb(msg.author.toString() + " Invalid image url!")
                    return
                }
                var embed = new Discord.MessageEmbed()
                embed.setThumbnail(ctx)

                var pa = JSON.parse(body)
                if (pa && pa.responses && pa.responses[0] && pa.responses[0].webDetection) {

                    //var searchQ = "meme" // /r/copypasta search query
                    if (!pa.responses[0] || !pa.responses[0].webDetection || !pa.responses[0].webDetection.bestGuessLabels[0].label) top = "MEME"
                    else top = pa.responses[0].webDetection.bestGuessLabels[0].label.toUpperCase()


                    request.get({
                        url: "https://inspirobot.me/api?generateFlow=1&sessionID=acb2e9ec-a4fc-4f29-ba71-d87c3d20f6eb"
                        //"https://inspirobot.me/api?generateFlow=1" //get random inspirational quote
                        }, function(err, response, body) {
                        if (err) {
                            cb("InspiroBot down :(")
                            return
                        }
                        var res = JSON.parse(body)
                        bottom = res.data[1].text // get random of 3 elements

                        var rand_id = Math.random().toString(36).substring(4)

                        cloudinary.uploader.upload(ctx, //upload the image to cloudinary
                          function(result) {

                            var fontSize =  (90*25) / top.length
                            if (fontSize > 120) fontSize = 100

                            var fontSize2 = (97*30) / bottom.length
                            if (fontSize2 > 50) fontSize2 = 50


                            bottom = encodeURI(bottom.replace(/\?/g,"").replace(/'/g,"").replace(/,/g,"").replace(/\n/g," "))
                            top = encodeURI(top.replace(/\?/g,"").replace(/'/g,"").replace(/,/g,"").replace(/\n/g," "))

                            var url = `https://res.cloudinary.com/dbfjrdqyp/image/upload/c_scale,h_616,q_100,w_1095/l_demotivational_poster_xxq1ss,g_north,y_-120/w_1300,c_lpad,l_text:Times_${fontSize}_letter_spacing_5:${top},y_320,co_rgb:FFFFFF/w_1300,c_lpad,l_text:Times_${fontSize2}_center:${bottom},y_400,co_rgb:FFFFFF/${rand_id}`

                            base64_request(url).then(function(data) {

                                var imageStream = new Buffer.from(data, 'base64');
                                var attachment = new Discord.MessageAttachment(imageStream, 'generated.png');

                                var embed = new Discord.MessageEmbed()
                                embed.attachFiles([attachment]);
                                embed.setImage('attachment://generated.png');

                                msg.channel.send(embed).then(function() { //upload buffer to discord
                                    cloudinary.uploader.destroy(rand_id, function(result) {  }); //delete cloudinary image
                                })
                            })
                          },
                          {public_id: rand_id}
                        )


                    });

                } else cb("I couldn't understand that image!")
            });

        }).catch(error => {
            cb(msg.author.toString() + " Invalid image url!")
        })
    }

    self.meme = (msg, ctx, config, cb) => {
        if (!ctx.trim()) return

        var params = ctx.trim().split(" ")

        if (!params[0] || !util.isImageURL(params[0])) {
            cb("Please use a valid image URL!")
            return
        }

        if (params.length < 2) {
            cb("Please include both an image and caption!\n`@whiskers meme [image URL] [top text|bottom text]`")
            return
        }

        params = [params[0], params.slice(1).join(" ")]

        var img_url = params[0]
        var top_text = params[1]
        var bottom_text = "_"

        if (top_text.includes('|')) {
    		var split = top_text.split('|')
    		top_text = split[0]
    		bottom_text = split[1]
        }
        if (!top_text.trim()) top_text = "_"
        if (!bottom_text.trim()) bottom_text = "_"

        var meme_url = `https://memegen.link/custom/${encodeURI(top_text)}/${encodeURI(bottom_text)}.jpg?alt=${encodeURIComponent(img_url)}&font=impact`
        base64_request(meme_url).then(function(data) {

            var imageStream = new Buffer.from(data, 'base64');
            var attachment = new Discord.MessageAttachment(imageStream, 'generated.png');

            var embed = new Discord.MessageEmbed()
            embed.attachFiles([attachment]);
            embed.setImage('attachment://generated.png');

            msg.channel.send(embed).catch(console.error)
        })
    }

    self.fakeperson = (msg, ctx, config, cb) => {
        base64_request(`https://thispersondoesnotexist.com/image`).then(function(data) {
            var imageStream = new Buffer.from(data, 'base64');
            var attachment = new Discord.MessageAttachment(imageStream, 'generated.png');

            var embed = new Discord.MessageEmbed()
            embed.attachFiles([attachment]);
            embed.setImage('attachment://generated.png');

            msg.channel.send(embed).catch(console.error)
        })
    }
}

//for >inspire

function generateCaption(labels, sub, cb) {
    if (labels == undefined || labels.length == 0) cb("funny image")
    else {

        var index =  Math.floor(Math.random()*labels.length)
        var tar = `http://www.reddit.com/r/${sub}/search.json?q=title:${encodeURIComponent(labels[index].description)}&sort=relevance&restrict_sr=on`

        while (labels.length > 0 && labels[index].description == undefined) {

            labels.splice(index,1)

            index = Math.floor(Math.random()*labels.length)
            if (labels[index] == undefined) {
                cb("ok buddy")
                return
            }
            tar = `http://www.reddit.com/r/${sub}/search.json?q=title:${encodeURIComponent(labels[index].description)}&sort=relevance&restrict_sr=on`
        }
        if (labels.length == 0) tar = `http://www.reddit.com/r/${sub}/new.json`

        request.get({
            url:tar
        },
        function (err, res, body) {
            if (!err) {
                var data
                try {
                    data = JSON.parse(body)
                }
                catch (e) {
                    cb("REDDIT IS DOWN")
                    return
                }
                var children = data.data.children
                if (children.length != 0) {

                    var rando = Math.floor(Math.random()*children.length)
                    var select = children[rando].data.title

                    cb(select)
                }
                else {
                    //console.log("Nothing for label '" + labels[index].description + "', retry")
                    labels.splice(index, 1)
                    generateCaption(labels, sub, cb)
                }
            }
        })
    }
}


/*
var download = function(uri, filename, callback) {
  request.head(uri, function(err, res, body){
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);

    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  })
}
*/

module.exports = ImageUtils
