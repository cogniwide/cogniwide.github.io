// import $ from 'jquery';
$(document).ready(function () {
    $(".chat_box_container").hide();
    $('.left').hide();
    $('.right').hide();
    $('.panel-footer').show();
    $('.left.initial_show').show(450);

    $(".fileupload").hide();

    $('.close').click(function () {
        $('.chat_box_container').hide(1000).removeClass('chat_box_active');
    });

    $('.see_next').click(function () {
        $('li:eq(1)').show(300);
        setTimeout(function () { $('li:eq(2)').show(2000); }, 2000);

    });

    $('.chat_btn_container').click(function () {
        $(".chat_box_container").show(100).toggleClass('chat_box_active');
    });

    $('.see_all').click(function () {
        $('.left,.right').show(1000);
        $('.panel-footer').show(2000);
    });


    $(".panel-body").scroll(function () {
        // declare variable
        var topPos = $(this).scrollTop();
        if (topPos > 50) {
            $(".panel-heading ").addClass("shaddow");

        } else {
            $(".panel-heading").removeClass("shaddow");
        }

    });

    /******* chat begins *******/

    if (typeof payload == "undefined") {
        payload =
            {
                'input': '',
                'event': 'default/welcome'
            }
    }

    $.ajaxSetup({
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    });
    var  backend_url = "http://18.223.108.176/insurance-backend/parse";

    var send_req =  (userQuery,event=null)=> {
            payload["input"] = userQuery;
            if (location.hostname === "localhost" || location.hostname === "127.0.0.1"){
                backend_url="http://localhost:8080/parse"
            }
            $.post(backend_url, JSON.stringify(payload))
                .done(((response)=>{
                    successRoutes(response);}))
                .fail((x,t,m)=>{
                    errorRoutes(x,t,m);
                });
            return true;
        };

    successRoutes = function (response) {
        var responseObject;
        if (typeof response == 'object') {
            responseObject = response;
        }
        else {
            var parsedResponse = JSON.parse(response);
            responseObject = parsedResponse.responseData;
        }
        if (responseObject["input_type"] != "text") {
            $(".composer").hide()
            if (responseObject["input_type"]=="file"){
                $(".fileupload").show()
            }

        } else {
            $(".composer").show()
            $(".fileupload").hide()
        }
        payload = responseObject;
        put_text(responseObject["response"]);
        show_quick_replies(responseObject["quick_replies"])
    };

    errorRoutes = function (x, t, m) {
        responseObject = payload;
        if (t === "timeout") {
            response = ["Due to band-width constraints, I'm not able to serve you now", "please try again later"]
        } else {
            response = ["I'm not able to serve you at the moment", " please try again later"]
        }
        payload = responseObject;
        put_text(response["response"]);
    };

    send_req("", 'insomnia');

    $('.textInput').keydown(function (e) {
        userQuery = $(".textInput").val();
        if (($('.textInput').val().trim().length > 0)) {

            if (e.keyCode == 13) {
                userQuery = $(".textInput").val();
                $(".textInput").val("");
                put_text([userQuery], user = "user")
                send_req(userQuery);
            }
        }
    })

            
    function scrollToBottom() {
        $(".panel-body").stop().animate({ scrollTop: $(".panel-body")[0].scrollHeight}, 1000);
    }

        var output = $("ul.chat");    
        var template_right = $("#template_right").html();
        var template_left = $("#template_left").html();

        var put_text = function (bot_say,user="bot") {
            var show_time = false

            $.each(bot_say, (index, data) => {
                var show_avatar = false
                if (index === (bot_say.length -1)) {
                    show_time =true
                }
                if (index === 0) {
                    show_avatar =true
                }
                
                if(user=="bot"){
                    var payload = {"message":data,
                    "show_time":show_time,
                    "show_text": ("text" in data),
                    "show_buttons": ("buttons" in data),
                    "show_image": ("image" in data),
                    "show_audio": ("audio" in data),
                    "show_rating": ("star_rating" in data),
                    "show_avatar":show_avatar
                };
                var html = Mustache.render(template_left, payload);
            } else {
                var payload = { "message": data }
                var html = Mustache.render(template_right, payload);
            }
            output.append(html);
        });
        scrollToBottom();
    };

    var quick_replies_element = $(".quick-replies");

    $(document).on("click", "#quick_reply_btn", function (e) {
        reply = e.target.innerText
        reply_id = e.target.getAttribute('data')
        put_text([reply], user = "user");
        send_req(reply_id);
        scrollToBottom();
    })

    $(document).on("click", ".send-button", function (e) {
        userQuery = $(".textInput").val();
        $(".textInput").val("");
        put_text([userQuery], user = "user")
        send_req(userQuery);
    })


    $(document).on("change", ".fileupload", function (e) {
        $(".fileupload").hide();
        $(".composer").show();
        put_text(["file uploaded"], user = "user")
        send_req(userQuery);
        $("#file-upload").val("");
    })

    var template_reply = $("#template_reply").html();

    function show_quick_replies(quick_replies) {
        quick_replies_element.html("");
        $.each(quick_replies, (index, data) => {
            // var reply = "<button type=\"button\" id=\"quick_reply_btn\" class=\"btn btn-outline-info text-left mx-2 see_all pl-4 bg-white\" data=\""+data["value"]+"\">"+data["text"]+"</button>"
            var reply = Mustache.render(template_reply, data);
            quick_replies_element.append(reply)
        });

    }
    

    $(".mic-btn").click(function() 
	{
		$(".textInput").focus();
	    if (window.hasOwnProperty('webkitSpeechRecognition')) {
     
            
            $(".mic-btn").css({opacity : 1})
	      var recognition = new webkitSpeechRecognition();
	 
	      recognition.continuous = false;
	      recognition.interimResults = false;
	 
	      recognition.lang = "en-IN";
	      recognition.start();
	 
	      recognition.onresult = function(e) {
            recognition.stop();
            $(".mic-btn").css({opacity : .6})
            console.log(e.results)
            put_text([e.results[0][0].transcript], user = "user")
	        setTimeout(send_req(e.results[0][0].transcript), 1000);
	      };
	 
	      recognition.onerror = function(e) {
	        recognition.stop();
	      }
	 
	    }
	});




/* 1. Visualizing things on Hover - See next part for action on click */
$(document).on("mouseover", "#stars li", function (e) {
    var onStar = parseInt($(this).data('value'), 10); // The star currently mouse on
   
    // Now highlight all the stars that's not after the current hovered star
    $(this).parent().children('li.star').each(function(e){
      if (e < onStar) {
        $(this).addClass('hover');
      }
      else {
        $(this).removeClass('hover');
      }
    });
    
  }).on('mouseout', function(){
    $(this).parent().children('li.star').each(function(e){
      $(this).removeClass('hover');
    });
  });
  
  
  /* 2. Action to perform on click */

  $(document).on("click", "#stars li", function (e) {
    var onStar = parseInt($(this).data('value'), 10); // The star currently selected
    var stars = $(this).parent().children('li.star');
    
    for (i = 0; i < stars.length; i++) {
      $(stars[i]).removeClass('selected');
    }
    
    for (i = 0; i < onStar; i++) {
      $(stars[i]).addClass('selected');
    }
    
    // JUST RESPONSE (Not needed)
    var ratingValue = parseInt($('#stars li.selected').last().data('value'), 10);
    var msg = "";
    if (ratingValue > 2) {
        msg = "Thanks! I'm glad we could help you";
    }
    else {
        msg = "Sorry,We will improve ourselves.";
    }
    put_text([{
       "text": msg
    }]);
    
  });
  

});