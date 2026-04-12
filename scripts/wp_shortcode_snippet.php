<?php
/**
 * Dynamic Tour Information Shortcode for Umiack Tours
 * Fetching data from GitHub JSON and rendering premium HTML template.
 */

function umiack_tour_shortcode($atts) {
    // 1. Get Tour ID from [tour_main id="xxx"]
    $a = shortcode_atts(array(
        'id' => 'ohanami', // Default to ohanami
    ), $atts);

    $tour_id = sanitize_text_field($a['id']);
    $cache_key = 'umiack_tour_data_' . $tour_id;
    
    // 2. Try to get data from Cache (Transient API - 1 hour)
    $tour_data_json = get_transient($cache_key);

    if (false === $tour_data_json) {
        // Fetch from GitHub Raw URL
        $github_url = "https://raw.githubusercontent.com/ryota-kayak/umiack-tours/main/data/{$tour_id}.json";
        $response = wp_remote_get($github_url);

        if (is_wp_error($response)) {
            return '<p style="color:red;">Error loading tour data from GitHub.</p>';
        }

        $tour_data_json = wp_remote_retrieve_body($response);
        
        // Cache for 1 hour
        set_transient($cache_key, $tour_data_json, HOUR_IN_SECONDS);
    }

    $data = json_decode($tour_data_json, true);

    if (!$data) {
        return '<p style="color:red;">Invalid tour data format.</p>';
    }

    // 3. Render HTML (Using the structure established in tour_template.html)
    ob_start();
    ?>

    <!-- WP Content Start -->
    <ul class="top-summary-list">
        <?php foreach ($data['summary_list'] as $item): ?>
            <li><?php echo esc_html($item); ?></li>
        <?php endforeach; ?>
    </ul>

    <div class="<?php echo esc_attr($data['youtube']['type']); ?>">
        <iframe src="https://www.youtube.com/embed/<?php echo esc_attr($data['youtube']['id']); ?>" title="YouTube" loading="lazy" allowfullscreen></iframe>
    </div>

    <figure class="wp-block-gallery has-nested-images columns-2 is-cropped">
        <?php foreach ($data['gallery'] as $img): ?>
            <figure class="wp-block-image size-large">
                <?php if ($img['full_url']): ?><a href="<?php echo esc_url($img['full_url']); ?>" target="_blank"><?php endif; ?>
                <img src="<?php echo esc_url($img['url']); ?>" alt="" class="wp-image-<?php echo esc_attr($img['id']); ?>" style="aspect-ratio:4/3" />
                <?php if ($img['full_url']): ?></a><?php endif; ?>
            </figure>
        <?php endforeach; ?>
    </figure>

    <p class="intro-paragraph"><?php echo nl2br(esc_html($data['intro_paragraph'])); ?></p>

    <p class="section-heading">☆見どころ☆</p>
    <ol class="highlights-list">
        <?php foreach ($data['highlights'] as $hl): ?>
            <li>
                <span class="feature-title"><?php echo esc_html($hl['title']); ?></span>
                <p><?php echo nl2br(wp_kses_post($hl['text'])); ?></p>
            </li>
        <?php endforeach; ?>
    </ol>

    <p class="section-heading">よくある質問（FAQ）</p>
    <dl class="faq-list">
        <?php foreach ($data['faqs'] as $faq): ?>
            <div class="faq-item">
                <dt class="faq-question">Q. <?php echo esc_html($faq['q']); ?></dt>
                <dd class="faq-answer">A. <?php echo esc_html($faq['a']); ?></dd>
            </div>
        <?php endforeach; ?>
    </dl>

    <p class="section-heading">詳細</p>
    <div class="tour-info-box">
        <dl class="tour-detail-list">
            <div class="detail-row">
                <dt class="tour-detail-label"><?php echo esc_html($data['details']['period']['label']); ?></dt>
                <dd>
                    <?php echo esc_html($data['details']['period']['value']); ?><br>
                    <?php if ($data['details']['period']['note']): ?>
                        <span class="detail-note"><?php echo esc_html($data['details']['period']['note']); ?></span>
                    <?php endif; ?>
                </dd>
            </div>

            <div class="detail-row">
                <dt class="tour-detail-label"><?php echo esc_html($data['details']['application']['label']); ?></dt>
                <dd>
                    <?php echo esc_html($data['details']['application']['text']); ?>
                    <div class="application-flex-container">
                        <div class="app-item app-line">
                            <a href="<?php echo esc_url($data['details']['application']['line_url']); ?>" class="btn-line">LINEでご相談</a>
                            <figure class="contact-line-qr-container">
                                <img src="<?php echo esc_url($data['details']['application']['line_qr_url']); ?>" alt="LINE QR" class="contact-line-qr-image" />
                            </figure>
                        </div>
                        <div class="app-item app-web">
                            <a href="<?php echo esc_url($data['details']['application']['contact_url']); ?>" class="btn-contact">WEBからお問い合わせ</a>
                        </div>
                        <div class="app-item app-phone">
                            <a href="tel:<?php echo esc_attr(str_replace('-', '', $data['details']['application']['phone_number'])); ?>" class="btn-phone">
                                <span class="btn-main-text">お電話でのお問合せ</span>
                                <span class="btn-sub-text"><?php echo esc_html($data['details']['application']['phone_number']); ?></span>
                            </a>
                        </div>
                    </div>
                </dd>
            </div>

            <div class="detail-row">
                <dt class="tour-detail-label">参加人数</dt>
                <dd><?php echo esc_html($data['details']['participants']); ?></dd>
            </div>

            <div class="detail-row">
                <dt class="tour-detail-label">コースレベル</dt>
                <dd><?php echo esc_html($data['details']['level']); ?></dd>
            </div>

            <div class="detail-row">
                <dt class="tour-detail-label">スケジュール</dt>
                <dd>
                    <p><?php echo nl2br(esc_html($data['details']['schedule']['intro'])); ?></p>
                    <ol class="schedule-timeline">
                        <?php foreach ($data['details']['schedule']['timeline'] as $event): ?>
                            <li>
                                <?php if (isset($event['time'])): ?><time><?php echo esc_html($event['time']); ?></time><?php endif; ?>
                                <span><?php echo esc_html($event['text']); ?></span>
                            </li>
                        <?php endforeach; ?>
                    </ol>
                </dd>
            </div>

            <div class="detail-row">
                <dt class="tour-detail-label">集合/解散</dt>
                <dd>
                    集合: <?php echo esc_html($data['details']['meeting_point']); ?><br>
                    解散: <?php echo esc_html($data['details']['dispersing_point']); ?>
                </dd>
            </div>

            <div class="detail-row">
                <dt class="tour-detail-label">参加費</dt>
                <dd><?php echo esc_html($data['details']['fee']); ?></dd>
            </div>

            <div class="detail-row">
                <dt class="tour-detail-label">サービス詳細</dt>
                <dd>
                    <strong>[含まれるもの]</strong> <?php echo esc_html($data['details']['services']['included']); ?><br>
                    <strong>[含まれないもの]</strong> <?php echo esc_html($data['details']['services']['excluded']); ?>
                </dd>
            </div>

            <div class="detail-row">
                <dt class="tour-detail-label">持ち物・服装</dt>
                <dd>
                    <ul class="gear-list">
                        <?php foreach ($data['details']['gear_list'] as $gear): ?>
                            <li><?php echo esc_html($gear); ?></li>
                        <?php endforeach; ?>
                    </ul>
                </dd>
            </div>

            <div class="detail-row">
                <dt class="tour-detail-label">保険</dt>
                <dd><?php echo wp_kses_post($data['details']['insurance']); ?></dd>
            </div>
        </dl>
    </div>
    <!-- WP Content End -->

    <?php
    return ob_get_clean();
}

add_shortcode('tour_main', 'umiack_tour_shortcode');
