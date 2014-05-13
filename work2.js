/**
 *@global
 *
 */
var right_margin, left_margin, center_page, menu_container, modal, //main DIVs
    vm = {
        stw: {
            header_exercise: ko.observable(0),
            header_set: ko.observable(0),
            bw: ko.observable(),
            wu: ko.observable(),
            exty: ko.observable(),
            mg: ko.observable(),
            ex: ko.observable(),
            wgt: ko.observable(),
            reps: ko.observable(),
            mi: ko.observable(),
            tut: ko.observable(),
            cmt: ko.observable(),
            ex_options: ko.observable(),
            setsBanner: ko.observable(1),
            exBanner: ko.observable(1)
        },
        stopwatch: {
            time: ko.observable(0),
            setTime: ko.observable(0),
            displayTime: ko.observable()
        }
    },
    query = {
        dbInsert: []
    },
    bools = {
        stopwatchRunning: false
    },
    sampleNames = [
        ["Push","Push ups","Resistance","Cardio","Isometric"],
        ["Push","Bench Press"],
        ["Push","Dips"],
        ["Pull","Pullups"],
        ["Pull","Horizontal Rows"],
        ["Pull","Bent Over Rows"],
        ["Shoulder","Hand Stand Push ups"],
        ["Shoulder","Military Press"],
        ["Core","Crunches"],
        ["Core","Hanging Leg Raise"],
        ["Legs","Squats"],
        ["Legs","Pistol Squats"]
    ],
    menu = ["Start Workout","Warmup Routine","Workout Analysis","Goals","Blank","Blank"],
    stwcateg = [
        ["bw","Y","Y","Body Weight","lbs"], //first Y/N for checkbox, second for input
        ["wu","Y","N","Warmed Up"],
        ["exty","N","N","Exercise Type"],
        ["mg","N","N","Muscle Group"],
        ["ex","N","N","Exercise"],
        ["wgt","Y","Y","Weight","lbs"],
        ["reps","Y","Y","Reps"],
        ["mi","Y","Y","Miles"],
        ["tut","Y","Y","TUT","ex: 1:50"],
        ["cmt","Y","Y","Comments"]
    ],
    flags = {
        stw: {},
    },
    globalStorage = {};
    


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

/**
 *@name standardDlg
 *@param {string} text to go onto the ok button
 *@param {function} function to call once the ok button is clicked
 *@param {string} text to go in the center of the dialog
 */
function standardDlg (buttontext, innertext, okAction) {
    var main, close, submit, content;

    modalize();
    
    if (!$('.standardDlg').length) {
        main = provide('DIV',{"class":"standardDlg"});
        close = provide('BUTTON',{"class":"dlgClose"});
        submit = provide('BUTTON',{"class":"dlgOk"});
        content = provide('DIV',{"class":"dlgDiv"});
        content.innerHTML = innertext;

        _.each([close, submit, content], function (e) {
            main.appendChild(e);
        });

        $('#modal').append(main);
        $('.dlgOk').on("click", okAction);
        $('.dlgClose').on("click", function () {
            unmodalize();
            $('.standardDlg').hide();
        }); 
    }
    $('.standardDlg').show();    
}

function modalize () {
    $('#modal').show();
}

function unmodalize () {
    $('#modal').hide();    
}

function stwChecked() {
    _.each(stwcateg, function (e) {
        if ($('#stwcheckbox_' + e[0] + ':checked').length === 1) {
            flags.stw[e[0]] = true;
            !!$('#stwinput_' + e[0]).length ? 
            $('#stwinput_' + e[0]).removeAttr('disabled') : 
            $('#stwselect_' + e[0]).removeAttr('disabled') ;
            $('#stwcomment_' + e[0]).removeAttr('disabled');
        } else if (!!$('#stwcheckbox_' + e[0]).length) {
            flags.stw[e[0]] = false;            
            !!$('#stwinput_' + e[0]).length ?
            $('#stwinput_' + e[0]).prop("disabled","true") :
            $('#stwselect_' + e[0]).prop("disabled","true") ;
            $('#stwcomment_' + e[0]).prop("disabled","true");
        }
        stwVals();
    });   
}

function stwVals() {
    _.each(stwcateg, function (e) {
        if (flags.stw[e[0]] === true) {
            !!$('#stwinput_' + e[0]).length ?
            vm.stw[e[0]]($('#stwinput_' + e[0]).val()) :
            vm.stw[e[0]]($('#stwselect_' + e[0] + ' option:selected').val()) ;
        } else {
            vm.stw[e[0]]("");
        }
    });
}


/**
 *@name standardDate
 *@returns {string} date: MM-DD-YYYY
 */
function standardDate() {
    var d8 = new Date();
    return  d8.getMonth() + "-" + d8.getDate() + "-" + d8.getFullYear();
}

/**
 *@name stopwatchConvert
 *@param {number} quantitative measurement of seconds
 *@returns {string} time: HH:MM:SS
 */
function stopwatchConvert (sec) {
    var h, m, s;
    
    sec = Number(sec) || 0;
    
    h = Math.floor(sec / 3600) >= 10 ? Math.floor(sec / 3600) : "0" + Math.floor(sec / 3600);
    m = Math.floor(sec / 60 % 60) > 9 ? Math.floor(sec / 60 % 60) : "0" + Math.floor(sec / 60 % 60);
    s = Math.floor(sec % 60) > 9 ? Math.floor(sec % 60) : "0" + Math.floor(sec % 60);

    return h + ":" + m + ":" + s;
}

/**
 *@name stop_watch
 *@param {number} index of button
 *@desc starts interval and records time, or stops, or resets
 */
function stop_watch(verb) {
    var clr;
    if (verb === 0 && !bools.stopwatchRunning) {
        interval = setInterval(function () {
            vm.stopwatch.setTime(vm.stopwatch.setTime() + 1);
            vm.stopwatch.time(vm.stopwatch.time() + 1);
            $('#stopwatch_display').html(stopwatchConvert(vm.stopwatch.time()));
        }, 1000);
        bools.stopwatchRunning = true;
    }
    if (verb === 1) {
        clearInterval(interval);
        bools.stopwatchRunning = false;
    }
    if (verb === 2) {
        if (bools.stopwatchRunning) { clearInterval(interval); }
        vm.stopwatch.time(0);
        $('#stopwatch_display').html(stopwatchConvert(vm.stopwatch.time()));
        bools.stopwatchRunning = false;
    }
}

function monitorBanner(eventcase) {
    var oldExercise;
    if (!!query.dbInsert.length) {
        oldExercise = _.last(query.dbInsert)[4];
        if (eventcase === "submit") {
            vm.stw.exBanner( 
                _.chain(query.dbInsert)
                .map(function (e) { return e[4]; })
                .uniq()
                .value()
                .length        
            )
            vm.stw.setsBanner(
                _.filter(query.dbInsert, function (e) {
                    return e[4] === _.chain(query.dbInsert)
                        .map(function (e) { return e[4]; })
                        .last()
                        .value()
                        .toString();
                }).length + 1 //to demarcate the current set (future tense)
            )
            globalStorage.oldNumbers = [
                vm.stw.exBanner(),
                vm.stw.setsBanner()
            ];
        }
        else if (eventcase === "change") {
            if ($('#stwtr_ex').find("select option:selected").val() === oldExercise) {
                vm.stw.exBanner(globalStorage.oldNumbers[0]);
                vm.stw.setsBanner(globalStorage.oldNumbers[1]);
            } else {
                vm.stw.exBanner(globalStorage.oldNumbers[0] + 1);
                vm.stw.setsBanner(1);
            }
        }
        else if (eventcase === "close") {
            vm.stw.exBanner(1);
            vm.stw.setsBanner(1);
        }
    }
}

function closeStopwatch () {
    $.extend(vm.stopwatch,{
        displayTime: ko.observable('00:00:00'),
        time: ko.observable(0),
        setTime: ko.observable(0)
    });
    stop_watch(2);
    $('#stopwatch').hide();    
    
}

function closeStwDlg() {
    if (query.dbInsert.length > 3 && !confirm("You have quite a few sets submitted, do you still want to continue?")) {
        return;
    }
    monitorBanner("close");    
    query.dbInsert = [];
    $('#startWorkout').hide();
    closeStopwatch();
}

function submission() {
    if (!!vm.stw.exty() && !!vm.stw.mg() && !!vm.stw.ex()) {
        if (Number(vm.stw.bw()) >= 0 &&  
            (!!Number(vm.stw.wgt()) || 
            !!Number(vm.stw.reps()) || 
            !!Number(vm.stw.mi()) ||
            !!Number(vm.stw.tut())))
        {
            query.dbInsert.push(query.submitArray);
            vm.stopwatch.setTime(0);
            monitorBanner("submit");
            return;
        }
        else
        {
            alert("you have either not entered any subfield data (weight,reps,mi,tut) or you have entered an invalid character");
        }
    } else {
        alert("Exercise Type, Muscle Group, and Exercise are mandatory fields, you must select something for each of them");
    }
}

//first the larger objects are taken care of
right_margin = provide('DIV',{"id":"right_margin","class":"right_margin"});
left_margin = provide('DIV',{"id":"left_margin","class":"left_margin"});
center_page = provide('DIV',{"id":"center_page","class":"center_page"});
menu_container = provide('DIV',{"id":"menu_container","class":"menu_container"});
modal = provide('DIV',{"id":"modal","class":"modal"});

//then the menu items
_.each(menu, function (e, i) {
    v = provide('DIV',{"class":"menu_items","id":"menu_item_" + i,"onclick":"create(" + i + ")"});
    v.innerHTML = e;
    menu_container.appendChild(v);
})
left_margin.appendChild(menu_container);

/************************************************ start_workout **************************************************/

function create(num) {
    function create_Start_Workout() {
        bools.start_workout_opened = true;
        
        var submit = "submit", finish = "finish", options = "options",
            start_workout,
            stopwatch,
            start_workout_header,
            start_workout_table,
            start_workout_footer,
            commentTextarea,
            stw = {
                checkbox: _.map(stwcateg, function (e, i) {
                    flags.stw[e[0]] = false; //multitasking and creating enable flags            
                    if (e[1] === "Y") {
                        return '<input id="stwcheckbox_' + stwcateg[i][0] + '" type="checkbox" onchange="stwChecked()" />';
                    }
                    flags.stw[e[0]] = true; //in order to instantiate non-checkbox related flags
                    return " ";
                }),
                input_select: (function () {
                    var opts = [ 
                            _.map(["Push","Pull","Shoulder","Core","Legs"], function (e) {
                                return '<option>' + e + '</option>';
                            }).join(''),
                            _.map(["resistance","cardio","isometric"], function (e) {
                                return '<option>' + e + '</option>';
                            }).join(''),
                            _.map(["nope","lightly","moderately","sufficiently","overly"], function (e) {
                                return '<option>' + e + '</option>';
                            }).join('')
                        ],
                        arr = _.map(stwcateg, function (e, i) {
                            if (e[2] === "Y") {
                                    return '<input ' +
                                            'id="stwinput_' + stwcateg[i][0] + '" ' + 
                                            'type="text" ' + 
                                            'placeholder="' + (stwcateg[i][4] || ' ') + '" ' +
                                            'onkeyup="stwVals()" />';
                            }
                            return '<select id="stwselect_' + stwcateg[i][0] + '" type="dropdown" onchange="stwVals()">' +
                                    '<option value="">Click to choose</option>' + opts.pop() + //value 1 temporary
                                    '</select>';
                        });
                    return arr;
                }())
            };
        ko.computed(function () {
            query.submitArray = [
                Number(vm.stw.bw()) || null,
                vm.stw.wu(),
                vm.stw.exty(),
                vm.stw.mg(),
                vm.stw.ex(),
                Number(vm.stw.wgt()) || null,
                Number(vm.stw.reps()) || null,
                Number(vm.stw.mi()) || null,
                Number(vm.stw.tut()) || null,
                Number(vm.stopwatch.setTime()) || null
            ]
        });
            

        start_workout = provide('DIV',{"id":"startWorkout"});
        start_workout_header = provide('HEADER',{"id":"startWorkout_header"});
        start_workout_header.innerHTML = (
            '<button id="startWorkout_close" onclick="closeStwDlg()"></button>' +
            '<p></p>'
        );

        start_workout_table = provide('TABLE',{"id":"startWorkout_table","class":"center_page_table"});
        start_workout_table.innerHTML = 
            '<tbody>' + 
            //'<tr><th></th><th></th><th></th></tr>' +
            _.map(stwcateg, function (e, i) {
                return '<tr id="stwtr_' + e[0] + '">' + 
                            '<td>' + stw.checkbox[i] + '</td>' + 
                            '<td>' + e[3] + '</td>' + 
                            '<td>' + stw.input_select[i] + '</td>' + 
                        '</tr>';
            }).join('') + 
            '</tbody>';

        start_workout_footer = provide('FOOTER', {"id":"startWorkout_footer"});
        _.each(_.map([submit, finish, options], 
            function (elt, i) {
                var arr = ["submission()","finalize()","optionsDlg()"]
                elt = provide('BUTTON', {"id":"stw_" + elt,"class":"stwBottomButtons","onclick":arr[i]});
                return elt;
            }), function (e) { 
            start_workout_footer.appendChild(e);
        });
        
        (function Create_Stopwatch() {
            var start = "start", stop = "stop", reset = "reset", display = provide('P', {"id":"stopwatch_display"});

            stopwatch = provide('DIV', {"id":"stopwatch"});
            _.each(_.union([display], _.map([start, stop, reset], //fancy pants way of appending all
                function (elt, i) {
                    elt = provide('BUTTON', {"id":"stopwatch_" + elt,"class":"stopwatchButtons","onclick":"stop_watch(" + i + ")"});
                    return elt;
                })), function (e) { 
                stopwatch.appendChild(e);
            }); 
            display.innerHTML = stopwatchConvert(vm.stopwatch.displayTime());

            right_margin.appendChild(stopwatch);

        }());

        _.each([start_workout_header, start_workout_table, start_workout_footer], function (e) {
            start_workout.appendChild(e);
        });
        center_page.appendChild(start_workout);

    }
    
    if (num === 0) {
        if (!bools.start_workout_opened) {
            create_Start_Workout();
            stwChecked();
            
            //html concatenated and thus able to refer as a an object.
            //binding of muscle group and exercise
            $('#stwtr_mg').find('select').on("change", function () {    
                $('#stwtr_ex').find('select').html(
                    _.map(sampleNames, function (e) {
                        if (e[0] === $('#stwtr_mg').find('select option:selected').val()) {
                            return '<option>' + e[1] + '</option>';
                        }
                    }).join('')
                )
                monitorBanner("change");                
            });
            
            $('#stwtr_ex').find('select').on("change", function () {
                monitorBanner("change");
            });
            
            //controlling the banner...
            ko.computed(function () {
                $('#startWorkout_header p').html(
                    'Exercise ' + vm.stw.exBanner() + ' Set ' + vm.stw.setsBanner()   
                );
            });
            
            $('#stwinput_cmt').on("focus", function () {
                standardDlg(
                    'Done',
                    '<textarea class="cmtText"></textarea>', 
                    function () {
                        $('#stwinput_cmt').val($('.cmtText').val());
                        unmodalize();
                        $('.standardDlg').hide();
                    }
                )
            })
            
            
            
        } else {
            $('#startWorkout').show();
            $('#stopwatch').show();    
        }
    }
}

/************************************************ append everything **************************************************/
_.each([right_margin, center_page, left_margin, modal], function (e) {
    $(function () {
        $( 'body' ).append(e);
    });
});
