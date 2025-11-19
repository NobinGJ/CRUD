document.addEventListener('DOMContentLoaded', () => {

    // --- Cargar videos desde la nube ---
    const loadVideosFromCloud = () => {
        if (typeof getVideoUrl !== 'function') {
            console.log('video-config.js no está cargado o getVideoUrl no está disponible');
            return;
        }

        const videoMap = {
            'video-introduccion': 'introduccion',
            'video-crud-completo': 'crudCompleto',
            'video-validacion': 'validacion',
            'video-api-rest': 'apiRest'
        };

        Object.entries(videoMap).forEach(([elementId, configKey]) => {
            const videoElement = document.getElementById(elementId);
            if (!videoElement) return;

            const cloudUrl = getVideoUrl(configKey);
            if (!cloudUrl) {
                console.log(`No hay URL configurada para ${configKey}, usando video local`);
                return;
            }

            // Si es YouTube, usar iframe en lugar de video
            if (cloudUrl.includes('youtube.com') || cloudUrl.includes('youtu.be')) {
                const videoWrapper = videoElement.closest('.video-wrapper') || videoElement.closest('.intro-media');
                if (videoWrapper) {
                    let youtubeVideoId = null;
                    
                    if (cloudUrl.includes('/embed/')) {
                        youtubeVideoId = cloudUrl.split('/embed/')[1].split('?')[0];
                    } else if (cloudUrl.includes('youtu.be/')) {
                        youtubeVideoId = cloudUrl.split('youtu.be/')[1].split('?')[0];
                    } else if (cloudUrl.includes('youtube.com/watch?v=')) {
                        youtubeVideoId = cloudUrl.split('watch?v=')[1].split('&')[0];
                    }
                    
                    if (youtubeVideoId) {
                        const iframe = document.createElement('iframe');
                        iframe.src = `https://www.youtube.com/embed/${youtubeVideoId}`;
                        iframe.width = '100%';
                        iframe.height = '100%';
                        iframe.frameBorder = '0';
                        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
                        iframe.allowFullscreen = true;
                        iframe.style.position = 'absolute';
                        iframe.style.top = '0';
                        iframe.style.left = '0';
                        iframe.style.width = '100%';
                        iframe.style.height = '100%';
                        iframe.style.borderRadius = '14px 14px 0 0';
                        
                        videoElement.style.display = 'none';
                        videoWrapper.appendChild(iframe);
                    }
                }
            } else if (cloudUrl.includes('drive.google.com')) {
                // Google Drive: usar iframe con preview para mejor compatibilidad
                const videoWrapper = videoElement.closest('.video-wrapper') || videoElement.closest('.intro-media');
                if (videoWrapper) {
                    let fileId = null;
                    if (cloudUrl.includes('/file/d/')) {
                        fileId = cloudUrl.split('/file/d/')[1].split('/')[0];
                    } else if (cloudUrl.includes('id=')) {
                        fileId = cloudUrl.split('id=')[1].split('&')[0];
                    }
                    
                    if (fileId) {
                        const iframe = document.createElement('iframe');
                        iframe.src = `https://drive.google.com/file/d/${fileId}/preview`;
                        iframe.width = '100%';
                        iframe.height = '500px';
                        iframe.frameBorder = '0';
                        iframe.allow = 'autoplay';
                        iframe.allowFullscreen = true;
                        iframe.style.display = 'block';
                        iframe.style.borderRadius = '14px 14px 0 0';
                        iframe.style.maxHeight = '500px';
                        
                        videoElement.style.display = 'none';
                        videoWrapper.appendChild(iframe);
                    }
                }
            } else {
                // Convertir URL de Google Drive al formato correcto para streaming
                let finalUrl = cloudUrl;
                if (cloudUrl.includes('drive.google.com')) {
                    // Extraer el ID del archivo de la URL
                    let fileId = null;
                    if (cloudUrl.includes('/file/d/')) {
                        fileId = cloudUrl.split('/file/d/')[1].split('/')[0];
                    } else if (cloudUrl.includes('id=')) {
                        fileId = cloudUrl.split('id=')[1].split('&')[0];
                    }
                    
                    if (fileId) {
                        // Usar formato de descarga directa para streaming
                        finalUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
                    }
                }
                
                // Para Cloudinary, Google Drive u otros, actualizar la fuente del video
                const existingSource = videoElement.querySelector('source');
                const videoType = existingSource?.type || 'video/webm';
                
                videoElement.innerHTML = '';
                const source = document.createElement('source');
                source.src = finalUrl;
                source.type = videoType;
                videoElement.appendChild(source);
                videoElement.load();
            }
        });
    };

    // Cargar videos después de que todo esté listo
    loadVideosFromCloud();

    // --- Presentación tipo H5P ---
    const slides = Array.from(document.querySelectorAll('.slide'));
    const timelineSteps = document.querySelectorAll('.timeline-step');
    const crudButtons = document.querySelectorAll('.crud-item');
    const nextSlideBtn = document.getElementById('next-slide');
    const prevSlideBtn = document.getElementById('prev-slide');
    const progressFill = document.getElementById('slide-progress-fill');
    const progressLabel = document.getElementById('progress-label');
    const pollOptions = document.querySelectorAll('.poll-option');
    const pollFeedback = document.getElementById('poll-feedback');
    const revealButtons = document.querySelectorAll('.reveal-btn');

    let currentSlide = 0;

    const updateProgress = (index) => {
        if (progressFill) {
            const progress = ((index + 1) / slides.length) * 100;
            progressFill.style.width = `${progress}%`;
        }
        if (progressLabel) {
            progressLabel.textContent = `Paso ${index + 1} de ${slides.length}`;
        }
    };

    const goToSlide = (index) => {
        if (!slides.length) return;
        const safeIndex = Math.min(Math.max(index, 0), slides.length - 1);
        slides.forEach(slide => slide.classList.remove('active'));
        slides[safeIndex].classList.add('active');
        currentSlide = safeIndex;

        // Actualizar timeline lateral
        timelineSteps.forEach(step => {
            const stepIndex = Number(step.dataset.slideTarget);
            step.classList.toggle('active', stepIndex === safeIndex);
        });

        updateProgress(safeIndex);
        slides[safeIndex].scrollTop = 0;
        slides[safeIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    timelineSteps.forEach(step => {
        step.addEventListener('click', () => {
            const stepIndex = Number(step.dataset.slideTarget);
            goToSlide(stepIndex);
        });
    });

    crudButtons.forEach(button => {
        button.addEventListener('click', () => {
            const target = Number(button.dataset.goSlide);
            if (!Number.isNaN(target)) {
                goToSlide(target);
            }
        });
    });

    if (nextSlideBtn) {
        nextSlideBtn.addEventListener('click', () => {
            goToSlide(currentSlide + 1);
        });
    }

    if (prevSlideBtn) {
        prevSlideBtn.addEventListener('click', () => {
            goToSlide(currentSlide - 1);
        });
    }

    document.addEventListener('keydown', (event) => {
        const tagName = document.activeElement?.tagName;
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tagName)) return;
        if (event.key === 'ArrowRight') {
            goToSlide(currentSlide + 1);
        }
        if (event.key === 'ArrowLeft') {
            goToSlide(currentSlide - 1);
        }
    });

    pollOptions.forEach(option => {
        option.addEventListener('click', () => {
            if (pollFeedback) {
                pollFeedback.textContent = option.dataset.feedback || '';
            }
        });
    });

    revealButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = `reveal-${button.dataset.reveal}`;
            const panel = document.getElementById(targetId);
            if (panel) {
                panel.classList.toggle('visible');
            }
        });
    });

    goToSlide(0);

    // --- Laboratorio de Escenarios ---
    const labScenarios = [
        {
            id: 'api-auth',
            title: 'API de usuarios autenticados',
            description: 'Expone endpoints sólo para clientes con token válido usando Sanctum o Passport.',
            tags: ['API', 'Sanctum', 'POST', 'Middleware'],
            code: `Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
});`,
            tip: 'Configura rate limiting para evitar abuso en endpoints sensibles.',
            advancedTip: 'Registra eventos para invalidar tokens cuando un usuario cambie contraseña.'
        },
        {
            id: 'admin-dashboard',
            title: 'Panel administrativo de usuarios',
            description: 'Gestiona usuarios desde un dashboard protegido con roles y políticas.',
            tags: ['Blade', 'Policies', 'SoftDeletes'],
            code: `Route::middleware(['auth', 'can:manage-users'])->group(function () {
    Route::resource('admin/users', Admin\\UserController::class)
        ->except(['show']);
});`,
            tip: 'Agrupa middleware en un RouteServiceProvider para mantener limpio web.php.',
            advancedTip: 'Utiliza Livewire o Inertia para refrescar tablas sin recargar la página.'
        },
        {
            id: 'public-form',
            title: 'Formulario público con verificación',
            description: 'Recibe postulaciones públicas pero verifica con reCAPTCHA y colas de correo.',
            tags: ['Validación', 'Recaptcha', 'Queue'],
            code: `Route::post('/postulaciones', [ApplicationController::class, 'store']);

public function store(ApplicationRequest $request) {
    $application = Application::create($request->validated());
    SendConfirmation::dispatch($application);
}`,
            tip: 'Guarda el IP y user agent para detectar patrones de spam.',
            advancedTip: 'Implementa un Job que limpie postulaciones duplicadas cada noche.'
        },
        {
            id: 'reporting',
            title: 'Lecturas para reportes',
            description: 'Genera reportes filtrados reutilizando consultas con scopes y recursos JSON.',
            tags: ['Reports', 'Scopes', 'Resource'],
            code: `Route::get('/reports/users', [ReportController::class, 'users']);

public function users(Request $request) {
    $users = User::withCount('posts')
        ->when($request->from, fn($q) => $q->whereDate('created_at', '>=', $request->from))
        ->get();

    return UserReportResource::collection($users);
}`,
            tip: 'Convierte consultas pesadas en vistas materializadas desde el scheduler.',
            advancedTip: 'Exporta a CSV usando respuestas stream para no saturar memoria.'
        }
    ];

    const labSelect = document.getElementById('scenario-select');
    const labTitle = document.getElementById('lab-title');
    const labDescription = document.getElementById('lab-description');
    const labTags = document.getElementById('lab-tags');
    const labCode = document.getElementById('lab-code');
    const labTip = document.getElementById('lab-tip');
    const labRandom = document.getElementById('lab-random');
    const labDebugToggle = document.getElementById('lab-debug-toggle');

    let currentScenario = labScenarios[0];

    const renderScenario = (scenario) => {
        if (!labTitle) return;
        labTitle.textContent = scenario.title;
        labDescription.textContent = scenario.description;
        labTags.innerHTML = '';
        scenario.tags.forEach(tag => {
            const span = document.createElement('span');
            span.textContent = tag;
            labTags.appendChild(span);
        });
        labCode.textContent = scenario.code;
        const showAdvanced = labDebugToggle && labDebugToggle.checked && scenario.advancedTip;
        labTip.textContent = showAdvanced ? scenario.advancedTip : scenario.tip;

        if (window.Prism && labCode) {
            Prism.highlightElement(labCode);
        }
    };

    if (labSelect) {
        labScenarios.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option.id;
            opt.textContent = option.title;
            labSelect.appendChild(opt);
        });
        labSelect.value = currentScenario.id;

        labSelect.addEventListener('change', () => {
            const selected = labScenarios.find(item => item.id === labSelect.value);
            if (selected) {
                currentScenario = selected;
                renderScenario(currentScenario);
            }
        });
    }

    if (labRandom) {
        labRandom.addEventListener('click', () => {
            const otherScenarios = labScenarios.filter(item => item.id !== currentScenario.id);
            const random = otherScenarios[Math.floor(Math.random() * otherScenarios.length)];
            currentScenario = random;
            if (labSelect) {
                labSelect.value = currentScenario.id;
            }
            renderScenario(currentScenario);
        });
    }

    if (labDebugToggle) {
        labDebugToggle.addEventListener('change', () => {
            renderScenario(currentScenario);
        });
    }

    renderScenario(currentScenario);

    // --- Lógica del Quiz ---
    const quizData = [
        {
            question: "¿Qué método HTTP se usa típicamente para crear un nuevo recurso?",
            options: ["GET", "POST", "PUT", "DELETE"],
            correct: 1
        },
        {
            question: "¿Cuál de estos archivos NO suele estar en la carpeta `app/Http/Controllers`?",
            options: ["UserController.php", "routes/web.php", "PostController.php", "AuthController.php"],
            correct: 1
        },
        {
            question: "¿Qué directiva de Blade se usa para proteger un formulario de ataques CSRF?",
            options: ["@csrf", "@method", "@token", "@protect"],
            correct: 0
        },
        {
            question: "¿Qué técnica de Laravel inyecta automáticamente un modelo en un método del controlador?",
            options: ["Dependency Injection", "Service Container", "Route Model Binding", "Eloquent Relationships"],
            correct: 2
        },
        {
            question: "Para actualizar un recurso, ¿qué método HTTP simula el formulario con la directiva `@method('PUT')`?",
            options: ["GET", "POST", "PATCH", "DELETE"],
            correct: 1
        }
    ];

    const quizQuestionEl = document.getElementById('quiz-question');
    const quizOptionsEl = document.getElementById('quiz-options');
    const nextQuestionBtn = document.getElementById('next-question');
    const resultsContainer = document.getElementById('quiz-results');
    const scoreDisplay = document.getElementById('score-display');
    const feedbackDiv = document.getElementById('feedback');
    const quizStepEl = document.getElementById('quiz-step');
    const quizProgressFill = document.getElementById('quiz-progress-fill');

    let currentQuestionIndex = 0;
    const userAnswers = new Array(quizData.length).fill(null);

    const renderQuizQuestion = () => {
        if (!quizQuestionEl || !quizOptionsEl) return;
        const questionData = quizData[currentQuestionIndex];
        quizQuestionEl.textContent = `${currentQuestionIndex + 1}. ${questionData.question}`;
        quizOptionsEl.innerHTML = '';

        questionData.options.forEach((option, idx) => {
            const optionBtn = document.createElement('button');
            optionBtn.type = 'button';
            optionBtn.className = 'option-pill';
            optionBtn.textContent = option;

            if (userAnswers[currentQuestionIndex] === idx) {
                optionBtn.classList.add('selected');
            }

            optionBtn.addEventListener('click', () => {
                userAnswers[currentQuestionIndex] = idx;
                renderQuizQuestion();
            });

            quizOptionsEl.appendChild(optionBtn);
        });

        if (quizStepEl) {
            quizStepEl.textContent = `Pregunta ${currentQuestionIndex + 1} de ${quizData.length}`;
        }

        if (quizProgressFill) {
            const denominator = Math.max(1, quizData.length - 1);
            const progress = (currentQuestionIndex / denominator) * 100;
            quizProgressFill.style.width = `${progress}%`;
        }

        if (nextQuestionBtn) {
            nextQuestionBtn.disabled = userAnswers[currentQuestionIndex] === null;
            nextQuestionBtn.textContent = currentQuestionIndex === quizData.length - 1 ? 'Ver resultado' : 'Siguiente';
        }

        if (resultsContainer) {
            resultsContainer.style.display = 'none';
        }
    };

    const showQuizResults = () => {
        let score = 0;
        feedbackDiv.innerHTML = '';

        quizData.forEach((item, index) => {
            const feedbackItem = document.createElement('div');
            feedbackItem.className = 'feedback-item';

            const userAnswer = userAnswers[index];
            if (userAnswer === item.correct) {
                score++;
                feedbackItem.classList.add('correct');
                feedbackItem.textContent = `✅ Pregunta ${index + 1}: Correcto.`;
            } else if (userAnswer === null) {
                feedbackItem.classList.add('incorrect');
                feedbackItem.textContent = `❌ Pregunta ${index + 1}: No respondida.`;
            } else {
                feedbackItem.classList.add('incorrect');
                feedbackItem.textContent = `❌ Pregunta ${index + 1}: Incorrecto. La respuesta correcta era "${item.options[item.correct]}".`;
            }

            feedbackDiv.appendChild(feedbackItem);
        });

        scoreDisplay.textContent = `Has acertado ${score} de ${quizData.length} preguntas.`;
        resultsContainer.style.display = 'block';
        resultsContainer.scrollIntoView({ behavior: 'smooth' });

        if (nextQuestionBtn) {
            nextQuestionBtn.disabled = true;
        }
    };

    if (nextQuestionBtn) {
        nextQuestionBtn.addEventListener('click', () => {
            if (userAnswers[currentQuestionIndex] === null) return;

            if (currentQuestionIndex < quizData.length - 1) {
                currentQuestionIndex++;
                renderQuizQuestion();
            } else {
                showQuizResults();
            }
        });
    }

    renderQuizQuestion();
});