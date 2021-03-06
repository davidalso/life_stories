
function hideAll() {
    $("#page1").hide();
    $("#page2").hide();
    $("#page3").hide();
}

var age;
var lifeBreaks = [];
var lifeStory = {};
// data structure will be: {story:[{startAge:0, endAge:4, text: 'foo'}, ...],
//     question:"what...?", answer:"bar"}

var questions = [
    "Is there a part of this you would change?",
    "What did you learn from this?",
    "What will be the story of the next 5 years?",
    "How is this different from the story you usually tell?",
    "Is there another story you could have told instead?",
    ]

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

$("#page1done").click(function() {
    var ageStr = $("#age").val();
    age = parseInt(ageStr);
    if (isNaN(age) || age < 0 || age > 120) { // let's be optimistic here
        $("#page1error").text("Sorry, you have to enter a valid age.");
        $("#age").select();
        return;
    }
    $("#page1error").text("");
    hideAll();
    setupPage2();
});

// returns a random integer between low (inclusive) and high (exclusive)
function randInt(low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

function setupPage2() {
    var numLifeBreaks = Math.max(5, age / 7); // you should have at least a few
    // life segments, but no matter how old you are you should have one every
    // few years I guess
    lifeBreaks = [];
    while (lifeBreaks.length < numLifeBreaks && lifeBreaks.length < age-1) {
        // the age-1 is a hack just in case you get someone who's, say, 3yo;
        // they can only have 2 breaks in their life, at 1 and 2
        newLifeBreak = randInt(1, age);
        if (lifeBreaks.indexOf(newLifeBreak) == -1) {
            lifeBreaks.push(newLifeBreak);
        }
    }
    lifeBreaks.push(0);
    lifeBreaks.sort(function cmp(a,b) {return a-b;}); // numeric, not lexicographic

    $("#page2").show();
    var numChunks = lifeBreaks.length;
    lifeBreaks.push(age);
    for (var i = 0; i < numChunks; i++) {
        
        var newBox = $("<div class='life_chunk'>" +
            "<div class='life_chunk_number'>" +
                "Age " + lifeBreaks[i] + " to " + lifeBreaks[i+1] + 
            "</div>" + 
            "<div class='life_chunk_text_box'>" +
                "<textarea maxlength='140' class='life_chunk_text'></textarea>" +
            "</div>" +
            "</div>");
        var numYears;
        if (i == lifeBreaks.length - 1) {
            numYears = age - lifeBreaks[i];
        } else {
            numYears = lifeBreaks[i+1] - lifeBreaks[i];
        }
        newBox.attr({"style": "height:" + (numYears * 30) + "px"});
        $("#boxes").append(newBox);
    }
}

$("#page2done").click(function() {
    lifeStory = {'story':[]}
    var textAreas = $("textarea.life_chunk_text");
    var numChunks = textAreas.length;
    lifeBreaks.push(age);
    for (var i = 0; i < numChunks; i++) {
        lifeStory.story[i] = {'startAge': lifeBreaks[i], 'endAge': lifeBreaks[i+1],
            'text': textAreas[i].value};
    }
    hideAll();

    var newStoryHtml = "<div class='life_story_display'>"; 
    newStoryHtml += "<div style='float:right; font-size:12pt'>Save</div>";
    for (var i = 0; i < lifeStory.story.length; i++) {
        var chunk = lifeStory.story[i];
        newStoryHtml +=
        "<div class='life_chunk_display' style='clear:both;'>" + 
            "<div style='float:left;'>" +
            chunk.startAge + " - " + chunk.endAge + ": " + chunk.text +
            "</div>" +
            "<div style='float:right;'>" +
                "<input type='checkbox' checked id='chunk_checkbox_" + chunk.startAge + "'></input>" + 
            "</div>" + 
        "</div>";
    }
    newStoryHtml += "</div>";
    newStoryHtml += "<div id='question'>" + questions[randInt(0, questions.length)] + "</div>";
    newStoryHtml += "<div><textarea maxlength='140' id='answer'></textarea></div>"
    
    $("#page3top").append(newStoryHtml);
    $("#page3").show();
});


$("#save").click(function() {
    if (lifeStory.question == undefined) {
        lifeStory.question = $("#question").text();
    }
    if (lifeStory.answer == undefined) {
        lifeStory.answer = $("#answer").val();
    }
    
    for (var i = 0; i < lifeStory.story.length; i++) {
        var checkbox_name = '#chunk_checkbox_' + lifeStory.story[i].startAge;
        if (!$(checkbox_name).prop('checked')) {
            lifeStory.story[i].text = '(private)';
        }
    }
    $("#saving").show();
    $.ajax({
        type: "POST",
        url: "/save",
        data: JSON.stringify(lifeStory),
        contentType:"application/json; charset=utf-8"
    }).done(function() {
        $("#saving").hide();
        $("#doneSaving").show();
    });
});

$("#restart").click(function() {
    hideAll();
    $("#page1").show();
    $("#boxes").html("");
    $("#page3top").html("Thanks.");
});
