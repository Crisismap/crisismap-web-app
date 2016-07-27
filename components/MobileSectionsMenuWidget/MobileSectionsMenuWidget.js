var nsGmx = nsGmx || {}

; + function() {

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

            this.sectionsIds = this.options.sectionsManager.getSectionsIds();

            this.sectionsIds.map(function(sectionId) {
                var sectionProps = this.options.sectionsManager.getSectionProperties(sectionId);
                var $swiperSlide = $('<div>').addClass('swiper-slide');
                $('<span>').addClass('sectionsSwiper-icon').addClass('icon-' + sectionProps.icon).appendTo($swiperSlide)
                $swiperSlide.appendTo($swiperWrapper);
            }.bind(this));

            $swiperWrapper.appendTo($swiperContainer);
            $swiperContainer.appendTo(this.$el);

            $swiperPagination = $('<div>').addClass('swiper-pagination');
            $swiperPagination.appendTo($swiperContainer);

            this.swiper = window.swiper = new Swiper($swiperContainer, {
                pagination: $swiperPagination[0],
                slidesPerView: 5,
                centeredSlides: true,
                paginationClickable: true,
                spaceBetween: 15
            });

            this._bindEvents();
        },

        appendTo: function(el) {
            $(el).append(this.$el);
        },

        reset: function() {
            this.swiper.update();
            this.swiper.slideTo(this.sectionsIds.indexOf(this.options.sectionsManager.getActiveSectionId()));
        },

        getActiveSectionId: function() {
            return this.sectionsIds[this.swiper.activeIndex];
        },

        _bindEvents: function() {
            this.swiper.on('slideChangeStart', function(swiper) {
                var sections = this.options.sectionsManager.getSectionsIds()
                this.options.sectionsManager.setActiveSectionId(sections[swiper.activeIndex])
                this.trigger('sectionchange');
            }.bind(this))
        }
    });

    var SectionsLegendWidget = Backbone.View.extend({
        className: 'sectionsLegendWidget',

        // options.sectionsManager
        initialize: function (options) {
            this.options = L.extend({}, options)
            this.options.sectionsManager.on('sectionchange', this.render.bind(this))
            this.render()
        },

        render: function () {
            var d = this.options.sectionsManager.getActiveSectionProperties().description
            this.$el.html(d || nsGmx.Translations.getText('crisismap.noSection'))
        },

        appendTo: function(el) {
            $(el).append(this.$el);
        }
    })

    nsGmx.MobileSectionsMenuControl = L.Control.extend({
        options: {
            className: 'mobileSectionsMenuControl'
        },

        includes: [nsGmx.FullscreenControlMixin],

        initialize: function (options) {
            L.setOptions(this, options)
        },

        render: function () {
            this.$el.empty()

            this.sectionsLegendWidget = new SectionsLegendWidget({
                sectionsManager: this.options.sectionsManager
            })
            this.sectionsLegendWidget.appendTo(this.$el)

            this.sectionsSwiperWidget = new SectionsSwiperWidget({
                sectionsManager: this.options.sectionsManager
            })
            this.sectionsSwiperWidget.appendTo(this.$el)
            this.sectionsSwiperWidget.reset()
        },

        destroy: function () {
            this.sectionsLegendWidget && this.sectionsLegendWidget.destroy && this.sectionsLegendWidget.destroy()
            this.sectionsSwiperWidget && this.sectionsSwiperWidget.destroy && this.sectionsSwiperWidget.destroy()
        },

        onAdd: function(map) {
            var className = this.options.className
            this.options = this.options || {}
            this.options.position = className.toLowerCase()

            this._controlCornerEl = L.DomUtil.create('div', 'leaflet-bottom leaflet-left leaflet-right ' + className +
                '-controlCorner', map._controlContainer)
            this._terminateMouseEvents(this._controlCornerEl)
            map._controlCorners[this.options.position] = this._controlCornerEl

            this._container = L.DomUtil.create('div', className)
            this.$el = $(this._container).hide()
            this.render()

            return this._container
        },

        onRemove: function (map) {
            map._controlCorners[this.options.position] = null
            this.destroy()
        },

        show: function () {
            this.$el.show()
            this.reset()
        },

        hide: function () {
            this.$el.hide()
        },

        toggle: function () {
            this.$el.toggle()
            this.reset()
        },

        reset: function() {
            this.sectionsSwiperWidget && this.sectionsSwiperWidget.reset();
        },

        _terminateMouseEvents: function(el) {
            L.DomEvent.disableClickPropagation(el)
            el.addEventListener('mousewheel', L.DomEvent.stopPropagation)
        }
    })
}();
