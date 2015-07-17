/* begin user filled options */
    var botName = "@all"; // Put your bot name in here
    var invokeStatement = "<span class=\"mention\">" + botName + "</span>";
/* end user filled options */
/* begin dependencies */
    var fileref=document.createElement('script');
        fileref.setAttribute("type","text/javascript");
        fileref.setAttribute("src", "https://domchristie.github.io/to-markdown/bower_components/to-markdown/dist/to-markdown.js");
        if (typeof fileref != "undefined") { document.getElementsByTagName("head")[0].appendChild(fileref); }
    if (!String.prototype.includes) {
        String.prototype.includes = function() {'use strict';
            return String.prototype.indexOf.apply(this, arguments) !== -1;
        };
    }
/* end dependencies */
/* begin regex */
    var regexForTagContent = /\[[^\]]+\]\(([^)]+)\)/g;
    var regexForLinks = /(\[[^\]]+\]\(([^)]+)\))/g;
    var regexForImages = /(\[!\[user\ image\]\(([^)]+)\)\]\(.*\))/g;
    var regexForTagNameAndSite = /\/\/(.*)\.stackexchange\.com\/questions\/tagged\/([a-z\-]+)/gi;
/* end   regex */
/* begin chat HTML elements */    
    var chat = document.getElementById("chat");
    var input = document.getElementById("input");
    var send = document.getElementById("sayit-button");
/* end HTML chat elements */
    var subscribedStorage = "a"; sessionStorage.setItem(localStorage, "{}");
    
    /* Returns the last chat message spoken */
    function getLastMessage() {
        return {
            content: chat.lastElementChild.children[1].lastElementChild.children[1].innerHTML,
            user: chat.lastElementChild.children[0].children[2].innerHTML.replace(/ /g,'')
        };
    }

    
    // ---------- Chat functions ----------
    /**
        Sends a message to chat
    */
    function sendMessage(message) {
        input.value = message;
        send.click();
    }
    function convertToChatLang(input){
        var tagMatches = regexForTagContent.exec(input);
        if (tagMatches != null){
            tagMatches.forEach(function(element){
                input = input.replace(element, tagModifier(element));
            });
        }
        var imageMatches = regexForImages.exec(input);
        if (imageMatches != null){
            for (var i = 1; i < imageMatches.length - 1; i += 2){
                input = input.replace(imageMatches[i], imageMatches[i + 1]);
            }
        }
        var linkMatches = regexForLinks.exec(input);
        
        if (linkMatches != null){
            console.log(linkMatches);
            for (var i = 1; i < linkMatches.length - 1; i += 2){
                input = input.replace(linkMatches[i], linkMatches[i + 1]);
            }
        }
        console.log(input);
        return input;
    }
    function tagModifier(input){
        var matches = regexForTagNameAndSite.exec(input);
        if (matches == null){ return input; }
        if (matches.length < 1){ return input; }
        var outputArray = [];
        for (var i = 1;  i <= matches.length - 1; i += 2){
            outputArray.push("[" + matches[i].replace('codereview', '').replace('meta.','meta-') + "tag:" + matches[i + 1] + "]");
        }
        return outputArray;
    }
    /**
        Sends a message @ a user
    */
    function sendTo(message, user) {
        sendMessage("@" + user + " " + message);
    }
    // ---------- Subscribed list functions ----------
    /**
        Returns an object representing the subscribed list from storage
    */
    function getSubscribedList() {
        return JSON.parse(localStorage.getItem(subscribedStorage));
    }
    /**
        Sets an object representing the subscribed list to storage
    */
    function setSubscribedList(newList) {
        localStorage.setItem(subscribedStorage, JSON.stringify(newList));
    }
    /**
        Adds a user to the subscribed list
    */
    function addToSubscribed(username) {
        var subscribed = getSubscribedList();
        subscribed[username] = true;
        setSubscribedList(subscribed);
    }
    /**
        Removes a user from the subscribed list
    */
    function removeFromSubscribed(username) {
        var subscribed = getSubscribedList();
        delete subscribed[username];
        setSubscribedList(subscribed);
    }
    /**
        Returns if a user is subscribed
    */
    function isSubscribed(username) {
        return (getSubscribedUsers().length > 0 ? (getSubscribedList()[username] != undefined) : false);
        /*if (getSubscribedUsers() != []) { return (getSubscribedUsers()[username] != null); }
        else { return false; }*/
    }
    /**
        Returns all the subscribed users
    */
    function getSubscribedUsers() {
        var users = [];
        var subscribed = getSubscribedList();
        for(var user in subscribed) {
            users.push(user.toString());
        }
        return users;
    }
    
    function main() {
        var message = getLastMessage();
        //var messageParts = message.content.split("");
    
        if (message.user != botName.replace('@', '')) {
            if (message.content.includes(invokeStatement)){
                var subMessage = message.content.split(invokeStatement)[1].toLowerCase();
                if (subMessage.includes("subscribe") && !(subMessage.includes("unsubscribe"))) {
                    if (!(isSubscribed(message.user))) {
                        addToSubscribed(message.user);
                        sendTo("You have been successfully subscribed.", message.user);
                    } else {
                        sendTo("You are already subscribed.", message.user);
                    }
                } else if (subMessage.includes("unsubscribe")) {
                    if (isSubscribed(message.user)) {
                        removeFromSubscribed(message.user);
                        sendTo("You have been successfully removed.", message.user);
                    } else {
                        sendTo("You are not subscribed.", message.user);
                    }
                } else {
                    if (isSubscribed(message.user)) {
                        var content = message.content.split(invokeStatement);
                        var usersString = "";
                        var subscribed = getSubscribedUsers();
                        for (var i = 0; i < subscribed.length; i++) {
                            usersString += ("@" + subscribed[i] + " ");
                        };
                        window.setTimeout(function() {
                            sendMessage(usersString + ': You were pinged by @' + message.user + ' who said:');
                        }, 2000);
                        content.forEach(function(element) {
                            if (element != ''){
                                window.setTimeout(function() {
                                    sendMessage(convertToChatLang(toMarkdown(element)));
                                }, 2000); // to prevent the chat from blocking the message due to it being sent too early
                            }
                        }, this);
                    } else {
                        sendTo("You must be subscribed to post here.", message.user);
                    }
                }
            }
        }
        window.setTimeout(main, 5000);
    }
    main();