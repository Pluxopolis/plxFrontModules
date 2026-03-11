<?php if(!defined('PLX_ROOT')) exit;
/**
 * module.php — pont PHP pour le module tts
 * $plxFront = instance de plxFront (accès à ->mode via plxMotorDemarrageEnd)
 * $plxHook  = 'head' ou 'body'
 */

/* Mode détecté proprement via plxMotorDemarrageEnd dans plxFront */
$ttsIntro    = !($plxFront->mode === 'article' || $plxFront->mode === 'static');
$fontsDir    = PLX_ROOT . 'plugins/plxFront/' . plxFront::MODULES_DIR . 'tts/fonts/';
$ttsHasFonts = file_exists($fontsDir . 'OpenDyslexic-Regular.woff2');

if ($plxHook === 'head') {

    if ($ttsHasFonts) {
        $fontsUrl = PLX_ROOT . 'plugins/plxFront/' . plxFront::MODULES_DIR . 'tts/fonts/';
        echo '<style>';
        echo '@font-face{font-family:"OpenDyslexic";src:url("'.$fontsUrl.'OpenDyslexic-Regular.woff2") format("woff2");font-weight:normal;font-style:normal;}';
        echo '@font-face{font-family:"OpenDyslexic";src:url("'.$fontsUrl.'OpenDyslexic-Bold.woff2") format("woff2");font-weight:bold;font-style:normal;}';
        echo '@font-face{font-family:"OpenDyslexic";src:url("'.$fontsUrl.'OpenDyslexic-Italic.woff2") format("woff2");font-weight:normal;font-style:italic;}';
        echo '</style>' . PHP_EOL;
    }

} elseif ($plxHook === 'body') {

    echo '<script>';
    echo 'window.plxFrontConfig = window.plxFrontConfig || {};';
    echo 'window.plxFrontConfig["tts"] = window.plxFrontConfig["tts"] || {};';
    echo 'window.plxFrontConfig["tts"].isIntro  = ' . ($ttsIntro    ? 'true' : 'false') . ';';
    echo 'window.plxFrontConfig["tts"].hasFonts = ' . ($ttsHasFonts ? 'true' : 'false') . ';';
    echo '</script>' . PHP_EOL;

}
?>
