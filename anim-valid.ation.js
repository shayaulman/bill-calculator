$(document).ready(function() {
$(".popup").hover( function() {
    $(".popup-text").toggleClass('show');
});
    // .focusin(function () {
    //     $(this).next().hide();
    //  });
});

 // # step-validation + animation  # //

 let currentFs, nextFs, previousFs; //fieldsets
 let left, opacity, scale; //fieldset properties to animate
 let animating; //flag to prevent quick multi-click glitches

 nextFs = $("fieldset").first(); // this *leads* to nextfs...
 $(document).on("keyup", function (e) {
    e.preventDefault();
    return e.keyCode === 13 && nextFs.find('.next').click();
 });


 $(".next").click(function() {
     
     currentFs = $(this).parent();
     nextFs = $(this).parent().next();

    // step-validation 
    let validateStep = true;   
    currentFs.find("input").each(function() {
        if ($(this).val() === "") {
            $(this).css("border", "1px solid red");
            validateStep = false;
            addAnimation(currentFs, "shake", 800);
        } else if ($(this).val() !== "") {
            $(this).css("border-color", "#ccc")
        }
    });
    console.log(currentFs);

        currentFs.find('.meters').each(function () { 
            if ( $(this).children(":first").val() > $(this).children(":last").val() ) {
                validateStep = false;
                $(this).children().css("border", "1px solid red");
                addAnimation(currentFs, "shake", 800);
                setTimeout(() => alert('קריאת מונה קודמת צריכה להיות יותר מקריאה קודמת 😉'), 0); // wait fir Jquery (weird...)
            }
        });
              
    if (!validateStep) return;

    if ($(this).hasClass('calculate')) {
        $(this).on("click", calculate())
    }
     
    if (animating) return false;
    animating = true;
     
     
    //activate next step on progressbar using the index of nextFs
    $("#progressbar li").eq($("fieldset").index(nextFs)).addClass("active");
    
    //show the next fieldset
    nextFs.show(); 
    //hide the current fieldset with style
    currentFs.animate({opacity: 0}, {
        step: function(now, mx) {
            //as the opacity of currentFs reduces to 0 - stored in "now"
            //1. scale currentFs down to 80%
            scale = 1 - (1 - now) * 0.2;
            //2. bring nextFs from the right(50%)
            left = (now * 50)+"%";
            //3. increase opacity of nextFs to 1 as it moves in
            opacity = 1 - now;
            currentFs.css({
        'transform': 'scale('+scale+')',
        'position': 'absolute'
    });
        nextFs.css({'left': left, 'opacity': opacity});
        }, 
        duration: 800, 
        complete: function(){
            currentFs.hide();
            animating = false;
        }, 
        //this comes from the custom easing plugin
        easing: 'easeInOutBack'
    });
});

$(".previous").click(function(){
    if(animating) return false;
    animating = true;

    currentFs = $(this).parent();
    previousFs = $(this).parent().prev();
    
    //de-activate current step on progressbar
    $("#progressbar li").eq($("fieldset").index(currentFs)).removeClass("active");
    
    //show the previous fieldset
    previousFs.show(); 
    //hide the current fieldset with style
    currentFs.animate({opacity: 0}, {
        step: function(now, mx) {
            //as the opacity of current_fs reduces to 0 - stored in "now"
            //1. scale previousFs from 80% to 100%
            scale = 0.8 + (1 - now) * 0.2;
            //2. take current_fs to the right(50%) - from 0%
            left = ((1-now) * 50)+"%";
            //3. increase opacity of previousFs to 1 as it moves in
            opacity = 1 - now;
            currentFs.css({'left': left});
            previousFs.css({'transform': 'scale('+scale+')', 'opacity': opacity});
        }, 
        duration: 800, 
        complete: function(){
            currentFs.hide();
            animating = false;
        }, 
        //this comes from the custom easing plugin
        easing: 'easeInOutBack'
    });
});

// deletes clculated resukts when going back
$("#result-previous-btn").on("click", function(){
    setTimeout(() => {  // wait for animation to finish 
        $("#result-table").html('');
    }, 1000); 
});

// enables Bootstrap's tooltip
$(document).ready(function(){

    $('[data-toggle="tooltip"]').hover(function() {
        // console.log($(this))
        if ($(this).val() !== '') {
            $(this).tooltip()
        }
    });
});

// $(document).ready(function(){
//     $('[data-toggle="tooltip"]').tooltip(); 
//   });


const addAnimation = (element, className, ms) => {
    element.addClass(className);
    setTimeout(() => element.removeClass(className), ms)
}


    