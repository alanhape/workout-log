

/**
 *@name provide
 *@param {string} reference to element wanted
 *@param {object} key value pairs of (attr, value)
 *@returns {object} DOM element
 */
function provide(elt, obj) {
    var outp = document.createElement(elt);
    
    if (obj) {
        obj = _.pairs(obj);
        _.each(obj, function (e) {
            outp.setAttribute(e[0],e[1]);   
        });
    }
    return outp;
}

//all body elements declared here
var right_margin, left_margin, center_page, menu_container,
    menu = ["m1","m2","m3","m4","m5","m6"],
    menuText = ["Start Workout","Warmup Routine","Workout Analysis","Goals","Blank","Blank"],
    start_workout_table,
    stw = {
        criterion: ["Body Weight","Warmed Up","Exercise Type","Muscle Group","Exercise","Weight","Reps","Sets","Miles","TUT"],
        explanation: ["[lbs]"," ","[Criteria]","[Targeted Muscles]"," ","[lbs]",
                       " ","[Default: 1]","[Cardio Only]","[Time Under Tension]"],
        chkbx: _.map(["Y","Y","N","N","N","Y","Y","Y","Y","Y"], function (e, i) {
                    if (e === "Y") {
                        return '<input id=stwchkbx"' + i + '" type="checkbox">';
                    }
                    return " ";
                })
    };

//first the larger objects are taken care of
right_margin = provide('DIV',{"id":"right_margin","class":"right_margin"});
left_margin = provide('DIV',{"id":"left_margin","class":"left_margin"});
center_page = provide('DIV',{"id":"center_page","class":"center_page"});
menu_container = provide('DIV',{"id":"menu_container","class":"menu_container"});

//then the menu items
_.each(menu, function (e, i) {
    v = provide('DIV',{"class":"menu_items","id":"menu_item_" + i});
    v.innerHTML = menuText[i];
    menu_container.appendChild(v);
})
left_margin.appendChild(menu_container)

//then the center content
start_workout_table = provide('TABLE',{"id":"startWorkout_table","class":"center_page_table"});
start_workout_table.innerHTML = 
    '<tbody>' + 
    '<tr><th></th><th id="stwth">Sets Logged: ko</th></tr>' +
    _.map(stw.criterion, function (e, i) {
        return '<tr>' + 
                    '<td>' + stw.chkbx[i] + '</td>' + 
                    '<td id="stwtd_' + i + '">' + e + '</td>' + 
                    '<td>' + stw.explanation[i] + '</td><td>BLANK</td>' + 
                '</tr>';
    }).join('') + 
    '</tbody>';
center_page.appendChild(start_workout_table);

//everything gets appended to page
_.each([right_margin, center_page, left_margin], function (e) {
    $(function () {
        $( 'body' ).append(e);
    });
});
