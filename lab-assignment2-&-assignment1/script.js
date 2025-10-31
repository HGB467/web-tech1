 $(function() {
            const $form = $('#contactForm');
            const $submitBtn = $form.find('.btn-submit');
            const $successMessage = $('#successMessage');
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const phoneRegex = /^[\+]?[(]?[\d\s\-\(\)]{10,}$/;

            function validateField($field) {
                const value = $.trim($field.val());
                let isValid = true;

                $field.removeClass('is-valid is-invalid');

                if ($field.prop('required') && !value) {
                    isValid = false;
                } else if ($field.attr('type') === 'email' && value && !emailRegex.test(value)) {
                    isValid = false;
                } else if ($field.attr('type') === 'tel' && value && !phoneRegex.test(value)) {
                    isValid = false;
                } else if (($field.attr('id') === 'firstName' || $field.attr('id') === 'lastName') && value && value.length < 2) {
                    isValid = false;
                } else if ($field.attr('id') === 'message' && value && value.length < 10) {
                    isValid = false;
                }

                if (isValid && value) {
                    $field.addClass('is-valid');
                } else if (!isValid) {
                    $field.addClass('is-invalid');
                }

                return isValid;
            }

            $form.find('.form-control, .form-select').on('blur', function() {
                validateField($(this));
            }).on('input', function() {
                if ($(this).hasClass('is-invalid')) {
                    validateField($(this));
                }
            });

            $form.on('submit', function(e) {
                e.preventDefault();
                let isFormValid = true;

                $form.find('.form-control, .form-select').each(function() {
                    if (!validateField($(this))) {
                        isFormValid = false;
                    }
                });

                if (!isFormValid) {
                    $form.find('.is-invalid').first().focus();
                    return;
                }

                $submitBtn.html('<span class="spinner-border spinner-border-sm me-2"></span>Sending...').prop('disabled', true);

                setTimeout(() => {
                    $form.hide();
                    $successMessage.show();

                    setTimeout(() => {
                        $form[0].reset();
                        $form.find('.form-control, .form-select').removeClass('is-valid is-invalid');
                        $submitBtn.html('<i class="fas fa-paper-plane me-2"></i>Send Message').prop('disabled', false);

                        $successMessage.hide();
                        $form.show();

                    }, 2000);
                    
                }, 2000);
            });
        });