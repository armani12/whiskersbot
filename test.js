
var configs = [
    {//BRUH MOMENT CONFIG   
    
        name: "/r/BruhMoment",
        id: "483122820843307008",
        
        helpMessage: "<:intj:505855665059921951> Hey dude, here are some tips \n"
                        + "...@ me with *propose [description]* to put your idea to vote\n"
                        + "...You can also @ me with *alert [severity 1-4]* to troll ping mods\n",
        specialReplies: [
            //nv
            {id: "<@223948083271172096>", reply: "needs to COPE"},
            
            //the turk
            {id: "<@244424870002163712>", reply: "https://media.discordapp.net/attachments/483123424601047081/513584457744384000/greece.jpg"},
            
            //hyperion
            {id: "<@161939643636383753>", reply: "https://cdn.discordapp.com/attachments/442214776660164631/513840477359964161/video.mov"},
            
            //ethovoid
            {id: "<@229337636265787402>", reply: "https://media.discordapp.net/attachments/483123424601047081/513758412342034442/unknown-42.png"},
            
            //me
            //{id: "<@!230878537257713667>", reply: "<:intj:505855665059921951>"} 
        ],
        
        fetch: 70, //message history to fetch on initiation
        
        //emotes
        upvote: "updoge",
        downvote: "downdoge",
        report: "report",
        
        //roles that can interact with the bot
        permissible: ['modera', 'admib'],
        
        //channels
        channels: {
            reportlog: "report-log",
            feedback: "feedback",
            modvoting: "mod-voting",
            modannounce: "mod-announcements",
            modactivity: "mod-activity",
        },
        
        //whitelist of channels where users can report messages
        reportable: ["general", "serious"],
        
        //voting threshold
        mod: {
            upvoteThresh: 5,
            downvoteThresh: 5,
        },
        pleb: {
            upvoteThresh: 5,
            reportThresh: 4
        }
    },
    
    { //OKBR CONFIG
        name: "r/okbuddyretard",
        id: "398241776327983104",
        
        helpMessage: "Hey dude, here are some tips \n"
                        + "...@ me with *propose [description]* to put your idea to vote\n"
                        + "...You can also @ me with *alert [severity 1-4]* to troll ping mods\n",
        specialReplies: [
            {id: "<@202204596779614209>", reply: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRuG5thDPAd9tEf5EhvEaUJWD0LIV9tMKNn02Wk-VbAXVu-AjfT"}    
        ],
        
        fetch: 70, //message history to fetch on initiation
        
        //emotes
        upvote: "peterthegreat",
        downvote: "moonlight",
        report: "retard",
        
        //roles that can interact with the bot
        permissible: ['king buddy', 'king retard', 'prince retard', 'head retard'],
        
        //channels
        channels: {
            reportlog: "report-log",
            feedback: "feedback",
            modvoting: "mod-voting",
            modannounce: "mod_announcements",
            modactivity: "mod-log",
        },
        
        //whitelist of channels where users can report messages
        reportable: ["general", "serious"],
        
        //voting threshold
        mod: {
            upvoteThresh: 6,
            downvoteThresh: 6,
        },
        pleb: {
            upvoteThresh: 6,
            reportThresh: 10
        }
    }
]

var Datastore = require('nedb')
  , db = new Datastore({ filename: 'db.json' })
  
db.loadDatabase(function (err) {
    if (err) console.error(err)
})

db.insert(configs[0], function(err) {console.error(err)} )
db.insert(configs[1], function(err) {console.error(err)} )