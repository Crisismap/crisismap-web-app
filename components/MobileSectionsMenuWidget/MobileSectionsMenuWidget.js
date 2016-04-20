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
                var sectionProps = this.options.sectionsManager.getSectionProperties(sectionId);
                var $swiperSlide = $('<div>').addClass('swiper-slide');
                $swiperSlide.html(sectionProps.description);
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


    var SectionsMenuWidget = Backbone.View.extend({
        className: 'sectionsMenuWidget',

        // options.sectionsManager
        initialize: function (options) {
            this.options = _.extend({}, options);
            this.render();
        },

        render: function () {
            this.options.sectionsManager.getSectionsIds().map(function (sectionId) {
                var sectionProps = this.options.sectionsManager.getSectionProperties(sectionId)
                $sectionButton = $('<div>').addClass('sectionsMenuWidget-sectionButton');
                $sectionButton.html(sectionProps.title);
                $sectionButton.appendTo(this.$el);
            }.bind(this));
        },

        appendTo: function (el) {
            $(el).append(this.$el);
        }
    });

    nsGmx.MobileSectionsMenuWidget = Backbone.View.extend({
        className: 'mobileSectionsMenuWidget',

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

            this.sectionsMenuWidget = new SectionsMenuWidget({
                sectionsManager: this.options.sectionsManager
            });
            this.sectionsMenuWidget.appendTo(this.$el);
        },

        reset: function() {
            this.sectionsSwiperWidget && this.sectionsSwiperWidget.reset();
        }
    });

}();
