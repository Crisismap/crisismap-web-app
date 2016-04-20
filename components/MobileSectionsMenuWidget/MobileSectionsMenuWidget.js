var nsGmx = nsGmx || {};

+ function() {

    var SectionsSwiperWidget = Backbone.View.extend({
        className: 'sectionsSwiper',

        // options.sectionsManager
        initialize: function(options) {
            this.options = _.extend({}, options);
            this.render();
        },

        render: function() {
            this.$el.empty();

            var $swiperContainer = $('<div>').addClass('swiper-container');
            var $swiperWrapper = $('<div>').addClass('swiper-wrapper');

            this.options.sectionsManager.getSectionsIds().map(function(sectionId) {
                var $swiperSlide = $('<div>').addClass('swiper-slide');
                $swiperSlide.html(this.options.sectionsManager.getSectionProperties(sectionId).description);
                $swiperSlide.appendTo($swiperWrapper);
            }.bind(this));

            $swiperWrapper.appendTo($swiperContainer);
            $swiperContainer.appendTo(this.$el);

            this.swiper = new Swiper($swiperContainer);
        },

        appendTo: function(el) {
            $(el).append(this.$el);
        },

        reset: function () {
            this.swiper.update();
        }
    });

    nsGmx.MobileSectionsMenuWidget = Backbone.View.extend({
        // options.sectionsManager
        initialize: function(options) {
            this.options = _.extend({}, options);
            this.render();
        },

        render: function() {
            this.$el.empty();
            this.sectionsSwiperWidget = new SectionsSwiperWidget({
                sectionsManager: this.options.sectionsManager
            });
            this.sectionsSwiperWidget.appendTo(this.$el);
        },

        reset: function() {
            this.sectionsSwiperWidget && this.sectionsSwiperWidget.reset();
        }
    });

}();
