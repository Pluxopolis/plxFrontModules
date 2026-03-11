(function() {
    'use strict';

    var config = (window.plxFrontConfig && window.plxFrontConfig['progressbar']) || {};
    var color  = config.color  || '#e07b39';
    var height = config.height || 3;

    /* Créer la barre */
    var bar = document.createElement('div');
    bar.id = 'plxfront-progressbar';
    bar.style.cssText = [
        'position:fixed',
        'top:0',
        'left:0',
        'width:0%',
        'height:' + height + 'px',
        'background:' + color,
        'z-index:9999',
        'transition:width 0.1s linear',
        'pointer-events:none'
    ].join(';');
    bar.setAttribute('role', 'progressbar');
    bar.setAttribute('aria-label', 'Progression de lecture');
    bar.setAttribute('aria-valuenow', '0');
    bar.setAttribute('aria-valuemin', '0');
    bar.setAttribute('aria-valuemax', '100');

    document.body.appendChild(bar);

    /* Mettre à jour au scroll */
    function update() {
        var scrollTop  = window.scrollY || document.documentElement.scrollTop;
        var docHeight  = document.documentElement.scrollHeight - window.innerHeight;
        var pct        = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
        bar.style.width = pct + '%';
        bar.setAttribute('aria-valuenow', pct);
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
})();
