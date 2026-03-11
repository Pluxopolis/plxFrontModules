(function() {
    'use strict';

    var config    = (window.plxFrontConfig && window.plxFrontConfig['copycode']) || {};
    var labelCopy = config.label_copy || 'Copier';
    var labelDone = config.label_done || 'Copié !';

    function addCopyButtons() {
        document.querySelectorAll('pre').forEach(function(pre) {
            /* Éviter les doublons */
            if (pre.querySelector('.plxfront-copy-btn')) return;

            var code = pre.querySelector('code');
            if (!code) return;

            var btn = document.createElement('button');
            btn.className   = 'plxfront-copy-btn';
            btn.textContent = labelCopy;
            btn.setAttribute('type', 'button');
            btn.setAttribute('aria-label', labelCopy);

            btn.addEventListener('click', function() {
                var text = code.innerText || code.textContent;
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(text).then(function() {
                        feedback(btn);
                    }).catch(function() {
                        fallbackCopy(text, btn);
                    });
                } else {
                    fallbackCopy(text, btn);
                }
            });

            /* Position relative sur pre pour ancrer le bouton */
            pre.style.position = 'relative';
            pre.appendChild(btn);
        });
    }

    function feedback(btn) {
        btn.textContent = labelDone;
        btn.classList.add('plxfront-copy-btn--done');
        setTimeout(function() {
            btn.textContent = labelCopy;
            btn.classList.remove('plxfront-copy-btn--done');
        }, 2000);
    }

    function fallbackCopy(text, btn) {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px';
        document.body.appendChild(ta);
        ta.select();
        try {
            document.execCommand('copy');
            feedback(btn);
        } catch(e) {}
        document.body.removeChild(ta);
    }

    /* Lancer après le chargement du DOM */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addCopyButtons);
    } else {
        addCopyButtons();
    }
})();
