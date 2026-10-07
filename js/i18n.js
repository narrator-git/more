// Internationalization (i18n) for more - English, Cantonese, Mandarin

const I18N_STORAGE_KEY = 'more_lang';

const translations = {
    en: {
        // Nav
        'nav.moreAI': 'more AI',
        'nav.psychologists': 'Our psychologists',
        'nav.login': 'Log In',
        'nav.dashboard': 'Dashboard',
        'nav.help': 'Help',
        'nav.logout': 'Log Out',

        // Index / Hero
        'hero.more': 'more',
        'hero.thanJust': 'than just a',
        'hero.therapy': 'therapy',
        'hero.startNow': 'Start now >',
        'hero.notSure': 'Not sure?',

        // Stats
        'stats.matchingParams': 'Matching Parameters',
        'stats.satisfaction': 'Satisfaction Rate',
        'stats.aiSupport': 'AI Support Available',

        // How it works
        'howItWorks.title': 'How it works',
        'howItWorks.step1Title': 'Share Your Story',
        'howItWorks.step1Desc': 'Tell us about yourself and what brings you here',
        'howItWorks.step2Title': 'AI Understands',
        'howItWorks.step2Desc': 'more AI discusses with you to get the full picture',
        'howItWorks.step3Title': 'Find Your Therapist',
        'howItWorks.step3Desc': 'Choose from AI-recommended specialists',
        'howItWorks.step4Title': 'Begin Therapy',
        'howItWorks.step4Desc': 'Start your sessions with your chosen therapist',
        'howItWorks.step5Title': 'AI Support',
        'howItWorks.step5Desc': 'Get instant pocket advice with full therapy context',

        // AI section
        'ai.badge': '24/7 Available',
        'ai.titleChat': 'CHAT WITH',
        'ai.titleAccent': 'more AI',
        'ai.description': 'Step 2: Discuss your situation with more AI. We\'ll ask questions to understand your needs, then recommend therapists who are the best fit. After you start therapy, more AI becomes your instant support tool with full context of your sessions.',
        'ai.feature1': 'Understands your needs',
        'ai.feature2': 'Recommends best therapists',
        'ai.feature3': 'Becomes your support tool after therapy',
        'ai.placeholder': 'Type your message here...',
        'ai.hint': 'Press Enter to send • Your message will open the chat',
        'ai.bubble1': 'Hi! I\'ll help understand your situation to find the right therapist.',
        'ai.bubble2': 'I\'ve been feeling anxious lately...',
        'ai.bubble3': 'Tell me more about when this happens.',
        'ai.bubble4': 'Usually at work, when I have deadlines',

        // Therapist section
        'therapist.findAmong': 'FIND PERSONAL THERAPIST AMONG',
        'therapist.specialists': '20+ MATCHING PARAMETERS',
        'therapist.findAmongSuffix': '',
        'therapist.sectionDesc': 'Step 3: After discussing with more AI, choose from therapists matched to your specific needs. All therapists are verified, licensed professionals.',
        'therapist.viewAll': 'View All Therapists →',

        // Login / Register
        'auth.welcomeBack': 'Welcome back',
        'auth.createAccount': 'Create your account',
        'auth.email': 'Email',
        'auth.password': 'Password',
        'auth.confirmPassword': 'Confirm Password',
        'auth.placeholderEmail': 'Enter your email',
        'auth.placeholderPassword': 'Enter your password',
        'auth.placeholderCreatePassword': 'Create a password',
        'auth.placeholderConfirm': 'Confirm your password',
        'auth.rememberMe': 'Remember me',
        'auth.forgotPassword': 'Forgot password?',
        'auth.signIn': 'Sign In',
        'auth.createAccountBtn': 'Create Account',
        'auth.noAccount': 'Don\'t have an account?',
        'auth.hasAccount': 'Already have an account?',
        'auth.psychologist': 'I am a psychologist',
        'auth.psychologistPortal': 'Psychologist Portal',

        // AI Chat page
        'chat.placeholder': 'Type your message here...',
        'chat.send': 'Send',
        'chat.upcomingSessions': 'Upcoming Sessions',
        'chat.notesTitle': 'Notes for your therapist',
        'chat.notesHint': 'Things you want to discuss in your next session',
        'chat.notesPlaceholder': 'e.g. I\'ve been feeling more anxious at work...',
        'chat.save': 'Save',
        'chat.bestMatches': 'Best Matches for You',
        'chat.modalMessage': 'Based on our conversation, here are therapists who are the best fit for you:',
        'chat.bookSession': 'Book Session',
        'chat.browseAll': 'Browse all therapists',
        'chat.greeting': "Hello! I'm here to help you. I've reviewed your information, and I'd like to understand more about what brings you here today. Can you tell me what you're hoping to get help with?",
        'chat.introTitle': 'Chat with more AI',
        'chat.introSubtitle': "I'm here to understand your needs and help you find the right therapist",
        'chat.noUpcomingSessions': 'No upcoming sessions',
        'chat.findTherapist': 'Find a therapist',
        'chat.toBookFirstSession': 'to book your first session',
        'chat.address': 'Address',
        'chat.join': 'Join',
        'chat.session': 'Session',
        'chat.saved': 'Saved!',
        'chat.connectionIssue': "I'm having trouble connecting right now. Please try again in a moment, or feel free to continue sharing.",
        'chat.connectionIssueDetail': 'Connection issue. Please check if the server is running.',
        'chat.awaitingSessionTitle': 'Your session is coming up',
        'chat.awaitingSessionText': 'Please attend your first therapy session with {therapist} before continuing with more AI.',
        'chat.awaitingSessionAfter': "After your session, I'll be here to help you reflect, process your thoughts, and support you between appointments.",
        'chat.withTherapist': 'with',
        'chat.goToDashboard': 'Go to Dashboard',
        'chat.continueTherapyTitle': 'Continue Your Therapy First',
        'chat.continueTherapyBody': "Please continue your initial therapy first so more AI can assist you in long-term therapy with your therapist. After you've started your therapy sessions, you can use more AI for ongoing support between sessions.",
        'chat.findingBestTherapists': "We're finding the best therapists for you. Please continue to see all available therapists.",
        'chat.match.best': 'Best Match',
        'chat.match.great': 'Great Match',
        'chat.match.good': 'Good Match',
        'chat.match.default': 'Match',
        'chat.therapist': 'Therapist',
        'chat.matchReasonFallback': 'Good match based on your needs',
        'chat.bookSessionWith': 'Book Session with {name}',
        'chat.topMatch': 'Top Match',
        'chat.yourTherapist': 'your therapist',

        // Therapist selection
        'selection.title': 'Find Your Therapist',
        'selection.subtitle': 'Licensed professionals matched to your needs — online or in person',
        'selection.searchPlaceholder': 'Search by name or specialty...',
        'selection.allSpecializations': 'All Specializations',
        'selection.reset': 'Reset',
        'selection.showingAll': 'Showing all therapists',
        'selection.showingAllCount': 'Showing all {count} therapists',
        'selection.showingCountOf': 'Showing {count} of {total} therapists',
        'selection.noTherapists': 'No therapists found',
        'selection.tryAdjusting': 'Try adjusting your filters or search terms.',
        'selection.clearFilters': 'Clear Filters',
        'selection.unableToLoad': 'Unable to load therapists',
        'selection.ensureServer': 'Please ensure the server is running and try again.',
        'selection.noneLoaded': 'No therapists loaded',
        'selection.specialization': 'Specialization',
        'selection.language': 'Language',
        'selection.sessionType': 'Session Type',
        'selection.both': 'Both',
        'selection.any': 'Any',
        'selection.yearsShort': 'yrs',
        'selection.viewProfile': 'View Profile',

        // Dashboard
        'dash.welcome': 'Welcome',
        'dash.hello': 'Hello!',
        'dash.bookSession': 'Book a Session',
        'dash.overview': 'Overview',
        'dash.schedule': 'Schedule',
        'dash.journal': 'Journal',
        'dash.profile': 'Profile',
        'dash.support': 'Support',
        'dash.upcomingSessions': 'Upcoming Sessions',
        'dash.completedSessions': 'Completed Sessions',
        'dash.journalEntries': 'Journal Entries',
        'dash.there': 'there',
        'dash.greeting.hello': 'Hello',
        'dash.greeting.morning': 'Good morning',
        'dash.greeting.afternoon': 'Good afternoon',
        'dash.greeting.evening': 'Good evening',

        // Therapist profile / Booking
        'booking.title': 'Book a session',
        'booking.sessionType': 'Session type',
        'booking.availableTimes': 'Available times',
        'booking.selectDateTime': 'Select date and time',
        'booking.online': 'Online',
        'booking.inPerson': 'In person',
        'booking.sessions': 'sessions',
        'booking.session': 'session',
        'booking.selectDateFromCalendar': 'Select a date from the calendar',
        'booking.noTimesThisDay': 'No available times on this day',
        'booking.bookAt': 'Book {sessionType} - {date} at {time}',
        'booking.selectDateTimeAlert': 'Please select a date and time',
        'booking.booking': 'Booking...',
        'booking.slotJustBooked': 'This time slot was just booked. Please select another.',
        'booking.patient': 'Patient',
        'booking.failed': 'Booking failed',
        'booking.level.junior': 'junior',
        'booking.level.mid': 'mid',
        'booking.level.senior': 'senior',
        'booking.mode.online': 'online',
        'booking.mode.in_person': 'in-person',
        'booking.mode.both': 'both online and in-person',
        'booking.bio.generated': 'Licensed {level} therapist with {years} years of experience specializing in {specializations}. I provide {sessionMode} therapy sessions.',

        // Onboarding
        'onboarding.prev': 'Previous',
        'onboarding.next': 'Next',
        'onboarding.selectOption': 'Select an option',
        'onboarding.selectCountry': 'Select your country',
        'onboarding.required': 'This field is required',
        'onboarding.invalid': 'Invalid input',
        'onboarding.questionOf': 'Question {current} of {total}',
        'onboarding.saveProfileFailed': 'Failed to save profile. Please try again.',
        'onboarding.loginToSave': 'Please log in to save your profile.',
        'onboarding.q.age.question': 'What is your age?',
        'onboarding.q.age.placeholder': 'Enter your age',
        'onboarding.q.age.error': 'Please enter a valid age between 13 and 120',
        'onboarding.q.gender.question': 'What is your gender?',
        'onboarding.q.location.question': 'What is your location or country?',
        'onboarding.q.concerns.question': 'What are your main concerns? (Select all that apply)',
        'onboarding.q.concerns.error': 'Please select at least one concern',
        'onboarding.q.previousTherapy.question': 'Have you had previous therapy experience?',
        'onboarding.q.communicationStyle.question': 'What is your preferred communication style?',
        'onboarding.q.financial.question': 'Any insurance or financial considerations we should know about?',
        'onboarding.q.financial.placeholder': 'Optional: Share any relevant information',
        'onboarding.opt.gender.male': 'Male',
        'onboarding.opt.gender.female': 'Female',
        'onboarding.opt.gender.nonBinary': 'Non-binary',
        'onboarding.opt.gender.preferNot': 'Prefer not to say',
        'onboarding.opt.gender.other': 'Other',
        'onboarding.opt.concern.anxiety': 'Anxiety',
        'onboarding.opt.concern.depression': 'Depression',
        'onboarding.opt.concern.stress': 'Stress',
        'onboarding.opt.concern.relationships': 'Relationships',
        'onboarding.opt.concern.work': 'Work',
        'onboarding.opt.concern.family': 'Family',
        'onboarding.opt.concern.trauma': 'Trauma',
        'onboarding.opt.concern.other': 'Other',
        'onboarding.opt.previousTherapy.yes': 'Yes',
        'onboarding.opt.previousTherapy.no': 'No',
        'onboarding.opt.previousTherapy.somewhat': 'Somewhat',
        'onboarding.opt.communication.text': 'Text-based',
        'onboarding.opt.communication.video': 'Video calls',
        'onboarding.opt.communication.phone': 'Phone calls',
        'onboarding.opt.communication.inPerson': 'In-person',

        // Months
        'month.january': 'January',
        'month.february': 'February',
        'month.march': 'March',
        'month.april': 'April',
        'month.may': 'May',
        'month.june': 'June',
        'month.july': 'July',
        'month.august': 'August',
        'month.september': 'September',
        'month.october': 'October',
        'month.november': 'November',
        'month.december': 'December',

        // Taxonomy
        'taxonomy.specialization.anxiety': 'Anxiety',
        'taxonomy.specialization.depression': 'Depression',
        'taxonomy.specialization.stress': 'Stress',
        'taxonomy.specialization.relationships': 'Relationships',
        'taxonomy.specialization.family': 'Family',
        'taxonomy.specialization.trauma': 'Trauma',
        'taxonomy.specialization.work': 'Work',
        'taxonomy.specialization.grief': 'Grief',
        'taxonomy.specialization.addiction': 'Addiction',
        'taxonomy.specialization.eating_disorders': 'Eating Disorders',
        'taxonomy.specialization.ptsd': 'PTSD',
        'taxonomy.specialization.ocd': 'OCD',
        'taxonomy.specialization.bipolar': 'Bipolar',
        'taxonomy.specialization.adhd': 'ADHD',
        'taxonomy.specialization.autism': 'Autism',
        'taxonomy.specialization.sleep': 'Sleep',
        'taxonomy.specialization.anger': 'Anger',
        'taxonomy.specialization.self_esteem': 'Self-Esteem',
        'taxonomy.specialization.lgbtq_plus': 'LGBTQ+',
        'taxonomy.specialization.couples': 'Couples',
        'taxonomy.specialization.teen': 'Teen',
        'taxonomy.specialization.elderly': 'Elderly',
        'taxonomy.specialization.mens_issues': "Men's Issues",
        'taxonomy.specialization.womens_issues': "Women's Issues",
        'taxonomy.specialization.career': 'Career',
        'taxonomy.specialization.life_transitions': 'Life Transitions',
        'taxonomy.language.english': 'English',
        'taxonomy.language.spanish': 'Spanish',
        'taxonomy.language.mandarin': 'Mandarin',
        'taxonomy.language.cantonese': 'Cantonese',
        'taxonomy.language.french': 'French',
        'taxonomy.language.german': 'German',
        'taxonomy.language.japanese': 'Japanese',
        'taxonomy.language.korean': 'Korean',
        'taxonomy.language.portuguese': 'Portuguese',
        'taxonomy.language.hindi': 'Hindi',
        'taxonomy.language.arabic': 'Arabic',
        'taxonomy.language.russian': 'Russian',
        'taxonomy.language.italian': 'Italian',
        'taxonomy.language.dutch': 'Dutch',
        'taxonomy.language.swedish': 'Swedish',
        'taxonomy.language.norwegian': 'Norwegian',
        'taxonomy.language.danish': 'Danish',
        'taxonomy.language.finnish': 'Finnish',
        'taxonomy.language.polish': 'Polish',
        'taxonomy.language.turkish': 'Turkish',
        // Short bios (API seed t1–t3 in server.js — shorter than mock data.js)
        'bio.licensed_clinical_psychologist_with_8_years_of_experience_specializing_in_anxiety_and_mood_disorders': 'Licensed clinical psychologist with 8 years of experience specializing in anxiety and mood disorders.',
        'bio.experienced_therapist_focusing_on_relationship_dynamics_and_family_systems': 'Experienced therapist focusing on relationship dynamics and family systems.',
        'bio.career_focused_therapist_helping_professionals_manage_work_related_stress': 'Career-focused therapist helping professionals manage work-related stress.',
        'bio.licensed_clinical_psychologist_with_8_years_of_experience_specializing_in_anxiety_and_mood_disorders_i_use_evidence_based_approaches_including_cbt_and_mindfulness': 'Licensed clinical psychologist with 8 years of experience specializing in anxiety and mood disorders. I use evidence-based approaches including CBT and mindfulness.',
        'bio.experienced_therapist_focusing_on_relationship_dynamics_and_family_systems_i_help_individuals_and_couples_navigate_complex_interpersonal_challenges': 'Experienced therapist focusing on relationship dynamics and family systems. I help individuals and couples navigate complex interpersonal challenges.',
        'bio.career_focused_therapist_helping_professionals_manage_work_related_stress_and_achieve_work_life_balance_specialized_in_workplace_anxiety_and_burnout': 'Career-focused therapist helping professionals manage work-related stress and achieve work-life balance. Specialized in workplace anxiety and burnout.',
        'bio.senior_psychologist_with_extensive_experience_in_trauma_informed_care_and_depression_treatment_i_provide_a_safe_supportive_environment_for_healing': 'Senior psychologist with extensive experience in trauma-informed care and depression treatment. I provide a safe, supportive environment for healing.',
        'bio.marriage_and_family_therapist_helping_individuals_and_families_build_stronger_connections_and_resolve_conflicts_effectively': 'Marriage and family therapist helping individuals and families build stronger connections and resolve conflicts effectively.',
        'bio.cognitive_behavioral_therapist_specializing_in_anxiety_disorders_and_stress_management_i_help_clients_develop_practical_coping_strategies': 'Cognitive-behavioral therapist specializing in anxiety disorders and stress management. I help clients develop practical coping strategies.',
        'bio.compassionate_therapist_with_expertise_in_treating_depression_and_anxiety_i_use_an_integrative_approach_tailored_to_each_clients_unique_needs': 'Compassionate therapist with expertise in treating depression and anxiety. I use an integrative approach tailored to each client\'s unique needs.',
        'bio.executive_coach_and_therapist_helping_professionals_navigate_career_challenges_and_improve_workplace_relationships': 'Executive coach and therapist helping professionals navigate career challenges and improve workplace relationships.',
        'bio.family_systems_therapist_with_deep_expertise_in_trauma_recovery_and_relationship_healing_i_create_a_nurturing_space_for_transformation': 'Family systems therapist with deep expertise in trauma recovery and relationship healing. I create a nurturing space for transformation.',
        'bio.young_energetic_therapist_specializing_in_helping_millennials_and_gen_z_navigate_modern_life_challenges_anxiety_and_career_transitions': 'Young, energetic therapist specializing in helping millennials and Gen Z navigate modern life challenges, anxiety, and career transitions.',

        // Common
        'common.loading': 'Loading...',
        'common.error': 'Error',
        'common.cancel': 'Cancel',
        'common.confirm': 'Confirm',
        'common.save': 'Save',
        'common.close': 'Close',
        'common.language': 'Language'
    },
    yue: {
        // Cantonese (廣東話) - Traditional Chinese
        'nav.moreAI': 'more AI',
        'nav.psychologists': '我哋嘅心理學家',
        'nav.login': '登入',
        'nav.dashboard': '控制台',
        'nav.help': '幫助',
        'nav.logout': '登出',

        'hero.more': 'more',
        'hero.thanJust': '唔止係',
        'hero.therapy': '治療',
        'hero.startNow': '立即開始 >',
        'hero.notSure': '唔肯定？',

        'stats.matchingParams': '配對參數',
        'stats.satisfaction': '滿意度',
        'stats.aiSupport': '24/7 AI 支援',

        'howItWorks.title': '點樣運作',
        'howItWorks.step1Title': '分享你嘅故事',
        'howItWorks.step1Desc': '話俾我哋知你嘅情況同埋點解嚟搵我哋',
        'howItWorks.step2Title': 'AI 了解你',
        'howItWorks.step2Desc': 'more AI 同你傾偈，全面了解你嘅需要',
        'howItWorks.step3Title': '搵你嘅治療師',
        'howItWorks.step3Desc': '從 AI 推薦嘅專家中揀選',
        'howItWorks.step4Title': '開始治療',
        'howItWorks.step4Desc': '同你揀嘅治療師開始療程',
        'howItWorks.step5Title': 'AI 支援',
        'howItWorks.step5Desc': '隨時獲得貼心建議，配合你嘅療程背景',

        'ai.badge': '24/7 可用',
        'ai.titleChat': '同',
        'ai.titleAccent': 'more AI',
        'ai.titleChatSuffix': '傾偈',
        'ai.description': '第二步：同 more AI 傾你嘅情況。我哋會問問題了解你嘅需要，然後推薦最適合你嘅治療師。開始治療之後，more AI 會成為你嘅即時支援工具，完全了解你嘅療程。',
        'ai.feature1': '了解你嘅需要',
        'ai.feature2': '推薦最佳治療師',
        'ai.feature3': '治療後成為你嘅支援工具',
        'ai.placeholder': '喺度輸入你嘅訊息...',
        'ai.hint': '按 Enter 發送 • 你嘅訊息會打開對話',
        'ai.bubble1': '你好！我會幫你了解情況，搵到啱你嘅治療師。',
        'ai.bubble2': '我最近有啲焦慮...',
        'ai.bubble3': '話俾我知多啲幾時會發生。',
        'ai.bubble4': '通常喺返工嘅時候，有死線嗰陣',

        'therapist.findAmong': '喺',
        'therapist.specialists': '20+ 個配對參數',
        'therapist.findAmongSuffix': '搵你嘅個人治療師',
        'therapist.sectionDesc': '第三步：同 more AI 傾完之後，從符合你需要嘅治療師中揀選。所有治療師都係經過驗證嘅持牌專業人士。',
        'therapist.viewAll': '查看所有治療師 →',

        'auth.welcomeBack': '歡迎返嚟',
        'auth.createAccount': '建立你嘅帳戶',
        'auth.email': '電郵',
        'auth.password': '密碼',
        'auth.confirmPassword': '確認密碼',
        'auth.placeholderEmail': '輸入你嘅電郵',
        'auth.placeholderPassword': '輸入你嘅密碼',
        'auth.placeholderCreatePassword': '設定密碼',
        'auth.placeholderConfirm': '確認你嘅密碼',
        'auth.rememberMe': '記住我',
        'auth.forgotPassword': '忘記密碼？',
        'auth.signIn': '登入',
        'auth.createAccountBtn': '建立帳戶',
        'auth.noAccount': '未有帳戶？',
        'auth.hasAccount': '已有帳戶？',
        'auth.psychologist': '我係心理學家',
        'auth.psychologistPortal': '心理學家入口',

        'chat.placeholder': '喺度輸入你嘅訊息...',
        'chat.send': '發送',
        'chat.upcomingSessions': '即將舉行嘅療程',
        'chat.notesTitle': '俾治療師嘅備註',
        'chat.notesHint': '你想喺下次療程討論嘅嘢',
        'chat.notesPlaceholder': '例如：我返工嗰陣愈嚟愈焦慮...',
        'chat.save': '儲存',
        'chat.bestMatches': '最啱你嘅配對',
        'chat.modalMessage': '根據我哋嘅對話，以下係最啱你嘅治療師：',
        'chat.bookSession': '預約療程',
        'chat.browseAll': '瀏覽所有治療師',

        'selection.title': '搵你嘅治療師',
        'selection.subtitle': '持牌專業人士，符合你嘅需要 — 網上或親身',
        'selection.searchPlaceholder': '搜尋姓名或專長...',
        'selection.allSpecializations': '所有專長',
        'selection.reset': '重設',
        'selection.showingAll': '顯示所有治療師',
        'selection.showingAllCount': '顯示全部 {count} 位治療師',
        'selection.showingCountOf': '顯示 {count} / {total} 位治療師',
        'selection.noTherapists': '搵唔到治療師',
        'selection.tryAdjusting': '試下調整篩選條件或搜尋字詞。',
        'selection.clearFilters': '清除篩選',

        'dash.welcome': '歡迎',
        'dash.hello': '你好！',
        'dash.bookSession': '預約療程',
        'dash.overview': '總覽',
        'dash.schedule': '時間表',
        'dash.journal': '日記',
        'dash.profile': '個人資料',
        'dash.support': '支援',
        'dash.upcomingSessions': '即將舉行嘅療程',
        'dash.completedSessions': '已完成療程',
        'dash.journalEntries': '日記條目',
        'dash.there': '你',
        'dash.greeting.hello': '你好',
        'dash.greeting.morning': '早晨',
        'dash.greeting.afternoon': '午安',
        'dash.greeting.evening': '晚上好',

        'booking.title': '預約療程',
        'booking.sessionType': '療程類型',
        'booking.availableTimes': '可用時間',
        'booking.selectDateTime': '選擇日期同時間',
        'booking.online': '網上',
        'booking.inPerson': '親身',
        'booking.sessions': '療程',

        'common.loading': '載入中...',
        'common.error': '錯誤',
        'common.cancel': '取消',
        'common.confirm': '確認',
        'common.save': '儲存',
        'common.close': '關閉',
        'common.language': '語言',
        'common.dash': '—',
        'chat.greeting': '你好！我喺度幫你。我睇過你嘅資料，想再了解多啲你而家嘅情況。你可以講下你希望得到咩幫助嗎？',
        'chat.introTitle': '同 more AI 傾偈',
        'chat.introSubtitle': '我會了解你嘅需要，幫你搵到合適治療師',
        'chat.noUpcomingSessions': '暫時冇即將療程',
        'chat.findTherapist': '搵治療師',
        'chat.toBookFirstSession': '去預約你第一節療程',
        'chat.address': '地址',
        'chat.join': '加入',
        'chat.session': '療程',
        'chat.saved': '已儲存！',
        'chat.connectionIssue': '而家連線有少少問題。請稍後再試，或者繼續分享都可以。',
        'chat.connectionIssueDetail': '連線出現問題，請檢查伺服器係咪運行中。',
        'chat.awaitingSessionTitle': '你嘅療程快到喇',
        'chat.awaitingSessionText': '請先同 {therapist} 完成你第一節療程，之後先繼續使用 more AI。',
        'chat.awaitingSessionAfter': '完成療程後，我會喺度幫你整理反思、梳理想法，並喺兩次療程之間支援你。',
        'chat.withTherapist': '同',
        'chat.goToDashboard': '前往控制台',
        'chat.continueTherapyTitle': '請先繼續你嘅治療',
        'chat.continueTherapyBody': '請先繼續你初步治療，咁 more AI 先可以喺你同治療師嘅長期療程中更有效支援你。當你開始療程後，就可以用 more AI 喺兩節之間得到持續支援。',
        'chat.findingBestTherapists': '我哋正為你搵最合適治療師。你而家都可以先睇全部可預約治療師。',
        'chat.match.best': '最佳配對',
        'chat.match.great': '非常配對',
        'chat.match.good': '良好配對',
        'chat.match.default': '配對',
        'chat.therapist': '治療師',
        'chat.matchReasonFallback': '根據你嘅需要，屬於合適配對',
        'chat.bookSessionWith': '預約同 {name} 嘅療程',
        'chat.topMatch': '首選配對',
        'chat.yourTherapist': '你嘅治療師',
        'selection.unableToLoad': '未能載入治療師資料',
        'selection.ensureServer': '請確認伺服器正在運行，然後再試。',
        'selection.noneLoaded': '未載入任何治療師',
        'selection.specialization': '專長',
        'selection.language': '語言',
        'selection.sessionType': '療程類型',
        'selection.both': '兩者',
        'selection.any': '任何',
        'selection.yearsShort': '年',
        'selection.viewProfile': '查看資料',
        'booking.session': '療程',
        'booking.selectDateFromCalendar': '請先喺月曆揀日期',
        'booking.noTimesThisDay': '當日冇可預約時段',
        'booking.bookAt': '預約 {sessionType} - {date} {time}',
        'booking.selectDateTimeAlert': '請選擇日期同時間',
        'booking.booking': '預約中...',
        'booking.slotJustBooked': '呢個時段啱啱被預約咗，請揀另一個。',
        'booking.patient': '個案',
        'booking.failed': '預約失敗',
        'booking.level.junior': '初級',
        'booking.level.mid': '中級',
        'booking.level.senior': '資深',
        'booking.mode.online': '網上',
        'booking.mode.in_person': '親身',
        'booking.mode.both': '網上及親身',
        'booking.bio.generated': '持牌{level}治療師，擁有 {years} 年經驗，專長包括 {specializations}。我提供{sessionMode}療程。',
        'onboarding.prev': '上一題',
        'onboarding.next': '下一題',
        'onboarding.selectOption': '請選擇一個選項',
        'onboarding.selectCountry': '請選擇你嘅國家',
        'onboarding.required': '此欄位必填',
        'onboarding.invalid': '輸入無效',
        'onboarding.questionOf': '第 {current} 題，共 {total} 題',
        'onboarding.saveProfileFailed': '儲存資料失敗，請再試一次。',
        'onboarding.loginToSave': '請先登入先可以儲存資料。',
        'onboarding.q.age.question': '你幾多歲？',
        'onboarding.q.age.placeholder': '輸入你嘅年齡',
        'onboarding.q.age.error': '請輸入 13 至 120 之間嘅有效年齡',
        'onboarding.q.gender.question': '你嘅性別係？',
        'onboarding.q.location.question': '你而家所在地或國家係？',
        'onboarding.q.concerns.question': '你主要關注咩問題？（可多選）',
        'onboarding.q.concerns.error': '請最少選擇一項關注',
        'onboarding.q.previousTherapy.question': '你之前有治療經驗嗎？',
        'onboarding.q.communicationStyle.question': '你偏好咩溝通方式？',
        'onboarding.q.financial.question': '有冇保險或財務考慮需要我哋知道？',
        'onboarding.q.financial.placeholder': '可選：分享任何相關資料',
        'onboarding.opt.gender.male': '男性',
        'onboarding.opt.gender.female': '女性',
        'onboarding.opt.gender.nonBinary': '非二元',
        'onboarding.opt.gender.preferNot': '唔想透露',
        'onboarding.opt.gender.other': '其他',
        'onboarding.opt.concern.anxiety': '焦慮',
        'onboarding.opt.concern.depression': '抑鬱',
        'onboarding.opt.concern.stress': '壓力',
        'onboarding.opt.concern.relationships': '關係',
        'onboarding.opt.concern.work': '工作',
        'onboarding.opt.concern.family': '家庭',
        'onboarding.opt.concern.trauma': '創傷',
        'onboarding.opt.concern.other': '其他',
        'onboarding.opt.previousTherapy.yes': '有',
        'onboarding.opt.previousTherapy.no': '冇',
        'onboarding.opt.previousTherapy.somewhat': '有少少',
        'onboarding.opt.communication.text': '文字訊息',
        'onboarding.opt.communication.video': '視像通話',
        'onboarding.opt.communication.phone': '電話通話',
        'onboarding.opt.communication.inPerson': '面對面',
        'month.january': '1月',
        'month.february': '2月',
        'month.march': '3月',
        'month.april': '4月',
        'month.may': '5月',
        'month.june': '6月',
        'month.july': '7月',
        'month.august': '8月',
        'month.september': '9月',
        'month.october': '10月',
        'month.november': '11月',
        'month.december': '12月'
        ,
        'taxonomy.specialization.anxiety': '焦慮',
        'taxonomy.specialization.depression': '抑鬱',
        'taxonomy.specialization.stress': '壓力',
        'taxonomy.specialization.relationships': '關係',
        'taxonomy.specialization.family': '家庭',
        'taxonomy.specialization.trauma': '創傷',
        'taxonomy.specialization.work': '工作',
        'taxonomy.specialization.grief': '哀傷',
        'taxonomy.specialization.addiction': '成癮',
        'taxonomy.specialization.eating_disorders': '飲食失調',
        'taxonomy.specialization.ptsd': '創傷後壓力症',
        'taxonomy.specialization.ocd': '強迫症',
        'taxonomy.specialization.bipolar': '躁鬱',
        'taxonomy.specialization.adhd': '專注力不足/過度活躍症',
        'taxonomy.specialization.autism': '自閉症譜系',
        'taxonomy.specialization.sleep': '睡眠問題',
        'taxonomy.specialization.anger': '憤怒管理',
        'taxonomy.specialization.self_esteem': '自尊',
        'taxonomy.specialization.lgbtq_plus': 'LGBTQ+',
        'taxonomy.specialization.couples': '伴侶關係',
        'taxonomy.specialization.teen': '青少年',
        'taxonomy.specialization.elderly': '長者',
        'taxonomy.specialization.mens_issues': '男性議題',
        'taxonomy.specialization.womens_issues': '女性議題',
        'taxonomy.specialization.career': '職涯',
        'taxonomy.specialization.life_transitions': '人生轉變',
        'taxonomy.language.english': '英文',
        'taxonomy.language.spanish': '西班牙文',
        'taxonomy.language.mandarin': '普通話',
        'taxonomy.language.cantonese': '廣東話',
        'taxonomy.language.french': '法文',
        'taxonomy.language.german': '德文',
        'taxonomy.language.japanese': '日文',
        'taxonomy.language.korean': '韓文',
        'taxonomy.language.portuguese': '葡萄牙文',
        'taxonomy.language.hindi': '印地語',
        'taxonomy.language.arabic': '阿拉伯語',
        'taxonomy.language.russian': '俄文',
        'taxonomy.language.italian': '意大利文',
        'taxonomy.language.dutch': '荷蘭文',
        'taxonomy.language.swedish': '瑞典文',
        'taxonomy.language.norwegian': '挪威文',
        'taxonomy.language.danish': '丹麥文',
        'taxonomy.language.finnish': '芬蘭文',
        'taxonomy.language.polish': '波蘭文',
        'taxonomy.language.turkish': '土耳其文',
        'bio.licensed_clinical_psychologist_with_8_years_of_experience_specializing_in_anxiety_and_mood_disorders': '持牌臨床心理學家，擁有 8 年經驗，專注焦慮及情緒障礙。',
        'bio.experienced_therapist_focusing_on_relationship_dynamics_and_family_systems': '資深治療師，專注關係互動同家庭系統。',
        'bio.career_focused_therapist_helping_professionals_manage_work_related_stress': '專注職涯議題嘅治療師，幫專業人士管理工作壓力。',
        'bio.licensed_clinical_psychologist_with_8_years_of_experience_specializing_in_anxiety_and_mood_disorders_i_use_evidence_based_approaches_including_cbt_and_mindfulness': '持牌臨床心理學家，擁有 8 年經驗，專注焦慮及情緒障礙。我採用實證方法，包括 CBT 同正念治療。',
        'bio.experienced_therapist_focusing_on_relationship_dynamics_and_family_systems_i_help_individuals_and_couples_navigate_complex_interpersonal_challenges': '資深治療師，專注關係互動同家庭系統。我會協助個人同伴侶面對複雜人際挑戰。',
        'bio.career_focused_therapist_helping_professionals_manage_work_related_stress_and_achieve_work_life_balance_specialized_in_workplace_anxiety_and_burnout': '專注職涯議題嘅治療師，幫專業人士管理工作壓力並建立工作生活平衡，專長職場焦慮同過勞。',
        'bio.senior_psychologist_with_extensive_experience_in_trauma_informed_care_and_depression_treatment_i_provide_a_safe_supportive_environment_for_healing': '資深心理學家，喺創傷知情照護同抑鬱治療方面經驗豐富。我提供安全同支持性環境，陪伴你復原。',
        'bio.marriage_and_family_therapist_helping_individuals_and_families_build_stronger_connections_and_resolve_conflicts_effectively': '婚姻及家庭治療師，協助個人同家庭建立更緊密連結，並有效處理衝突。',
        'bio.cognitive_behavioral_therapist_specializing_in_anxiety_disorders_and_stress_management_i_help_clients_develop_practical_coping_strategies': '認知行為治療師，專長焦慮障礙同壓力管理。我會幫你建立實用應對策略。',
        'bio.compassionate_therapist_with_expertise_in_treating_depression_and_anxiety_i_use_an_integrative_approach_tailored_to_each_clients_unique_needs': '富同理心嘅治療師，專長治療抑鬱同焦慮。我採用整合式方法，按每位來訪者需要度身制定。',
        'bio.executive_coach_and_therapist_helping_professionals_navigate_career_challenges_and_improve_workplace_relationships': '高管教練兼治療師，協助專業人士面對職涯挑戰，同改善職場關係。',
        'bio.family_systems_therapist_with_deep_expertise_in_trauma_recovery_and_relationship_healing_i_create_a_nurturing_space_for_transformation': '家庭系統治療師，喺創傷復原同關係修復方面有深厚經驗。我會打造一個滋養而安全嘅改變空間。',
        'bio.young_energetic_therapist_specializing_in_helping_millennials_and_gen_z_navigate_modern_life_challenges_anxiety_and_career_transitions': '年輕有活力嘅治療師，專門幫助千禧世代同 Z 世代面對現代生活挑戰、焦慮同職涯轉變。',
    },
    zh: {
        // Mandarin (普通话) - Simplified Chinese
        'nav.moreAI': 'more AI',
        'nav.psychologists': '我们的心理学家',
        'nav.login': '登录',
        'nav.dashboard': '控制台',
        'nav.help': '帮助',
        'nav.logout': '退出登录',

        'hero.more': 'more',
        'hero.thanJust': '不止是',
        'hero.therapy': '治疗',
        'hero.startNow': '立即开始 >',
        'hero.notSure': '不确定？',

        'stats.matchingParams': '匹配参数',
        'stats.satisfaction': '满意度',
        'stats.aiSupport': '24/7 AI 支持',

        'howItWorks.title': '如何运作',
        'howItWorks.step1Title': '分享你的故事',
        'howItWorks.step1Desc': '告诉我们你的情况和为什么来找我们',
        'howItWorks.step2Title': 'AI 了解你',
        'howItWorks.step2Desc': 'more AI 与你对话，全面了解你的需求',
        'howItWorks.step3Title': '找到你的治疗师',
        'howItWorks.step3Desc': '从 AI 推荐的专家中选择',
        'howItWorks.step4Title': '开始治疗',
        'howItWorks.step4Desc': '与你选择的治疗师开始疗程',
        'howItWorks.step5Title': 'AI 支持',
        'howItWorks.step5Desc': '随时获得贴心建议，配合你的疗程背景',

        'ai.badge': '24/7 可用',
        'ai.titleChat': '与',
        'ai.titleAccent': 'more AI',
        'ai.titleChatSuffix': '对话',
        'ai.description': '第二步：与 more AI 讨论你的情况。我们会提问以了解你的需求，然后推荐最适合你的治疗师。开始治疗后，more AI 将成为你的即时支持工具，完全了解你的疗程。',
        'ai.feature1': '了解你的需求',
        'ai.feature2': '推荐最佳治疗师',
        'ai.feature3': '治疗后成为你的支持工具',
        'ai.placeholder': '在此输入你的消息...',
        'ai.hint': '按 Enter 发送 • 你的消息将打开对话',
        'ai.bubble1': '你好！我会帮你了解情况，找到适合你的治疗师。',
        'ai.bubble2': '我最近有些焦虑...',
        'ai.bubble3': '告诉我更多关于什么时候会发生。',
        'ai.bubble4': '通常在工作的时候，有截止日期时',

        'therapist.findAmong': '在',
        'therapist.specialists': '20+ 个匹配参数',
        'therapist.findAmongSuffix': '找到你的个人治疗师',
        'therapist.sectionDesc': '第三步：与 more AI 对话后，从符合你需求的治疗师中选择。所有治疗师均为经过验证的持证专业人士。',
        'therapist.viewAll': '查看所有治疗师 →',

        'auth.welcomeBack': '欢迎回来',
        'auth.createAccount': '创建你的账户',
        'auth.email': '邮箱',
        'auth.password': '密码',
        'auth.confirmPassword': '确认密码',
        'auth.placeholderEmail': '输入你的邮箱',
        'auth.placeholderPassword': '输入你的密码',
        'auth.placeholderCreatePassword': '设置密码',
        'auth.placeholderConfirm': '确认你的密码',
        'auth.rememberMe': '记住我',
        'auth.forgotPassword': '忘记密码？',
        'auth.signIn': '登录',
        'auth.createAccountBtn': '创建账户',
        'auth.noAccount': '没有账户？',
        'auth.hasAccount': '已有账户？',
        'auth.psychologist': '我是心理学家',
        'auth.psychologistPortal': '心理学家入口',

        'chat.placeholder': '在此输入你的消息...',
        'chat.send': '发送',
        'chat.upcomingSessions': '即将举行的疗程',
        'chat.notesTitle': '给治疗师的备注',
        'chat.notesHint': '你想在下次疗程讨论的内容',
        'chat.notesPlaceholder': '例如：我工作时越来越焦虑...',
        'chat.save': '保存',
        'chat.bestMatches': '最适合你的配对',
        'chat.modalMessage': '根据我们的对话，以下是最适合你的治疗师：',
        'chat.bookSession': '预约疗程',
        'chat.browseAll': '浏览所有治疗师',

        'selection.title': '找到你的治疗师',
        'selection.subtitle': '持证专业人士，符合你的需求 — 在线或面对面',
        'selection.searchPlaceholder': '搜索姓名或专长...',
        'selection.allSpecializations': '所有专长',
        'selection.reset': '重置',
        'selection.showingAll': '显示所有治疗师',
        'selection.showingAllCount': '显示全部 {count} 位治疗师',
        'selection.showingCountOf': '显示 {count} / {total} 位治疗师',
        'selection.noTherapists': '未找到治疗师',
        'selection.tryAdjusting': '请尝试调整筛选条件或搜索词。',
        'selection.clearFilters': '清除筛选',

        'dash.welcome': '欢迎',
        'dash.hello': '你好！',
        'dash.bookSession': '预约疗程',
        'dash.overview': '概览',
        'dash.schedule': '日程',
        'dash.journal': '日记',
        'dash.profile': '个人资料',
        'dash.support': '支持',
        'dash.upcomingSessions': '即将举行的疗程',
        'dash.completedSessions': '已完成疗程',
        'dash.journalEntries': '日记条目',
        'dash.there': '你',
        'dash.greeting.hello': '你好',
        'dash.greeting.morning': '早上好',
        'dash.greeting.afternoon': '下午好',
        'dash.greeting.evening': '晚上好',

        'booking.title': '预约疗程',
        'booking.sessionType': '疗程类型',
        'booking.availableTimes': '可用时间',
        'booking.selectDateTime': '选择日期和时间',
        'booking.online': '在线',
        'booking.inPerson': '面对面',
        'booking.sessions': '疗程',

        'common.loading': '加载中...',
        'common.error': '错误',
        'common.cancel': '取消',
        'common.confirm': '确认',
        'common.save': '保存',
        'common.close': '关闭',
        'common.language': '语言',
        'common.dash': '—',
        'chat.greeting': '你好！我会在这里帮助你。我已经看过你的资料，想进一步了解你今天来这里的原因。你可以告诉我你希望得到什么帮助吗？',
        'chat.introTitle': '与 more AI 对话',
        'chat.introSubtitle': '我会了解你的需求，帮你找到合适的治疗师',
        'chat.noUpcomingSessions': '暂无即将到来的疗程',
        'chat.findTherapist': '寻找治疗师',
        'chat.toBookFirstSession': '来预约你的第一节疗程',
        'chat.address': '地址',
        'chat.join': '加入',
        'chat.session': '疗程',
        'chat.saved': '已保存！',
        'chat.connectionIssue': '我现在连接有点问题。请稍后再试，或继续分享你的情况。',
        'chat.connectionIssueDetail': '连接出现问题，请检查服务器是否正在运行。',
        'chat.awaitingSessionTitle': '你的疗程即将开始',
        'chat.awaitingSessionText': '请先与 {therapist} 完成第一次疗程，再继续使用 more AI。',
        'chat.awaitingSessionAfter': '完成疗程后，我会在这里帮助你反思、梳理想法，并在两次预约之间支持你。',
        'chat.withTherapist': '与',
        'chat.goToDashboard': '前往控制台',
        'chat.continueTherapyTitle': '请先继续你的治疗',
        'chat.continueTherapyBody': '请先继续你的初始治疗，这样 more AI 才能在你与治疗师的长期疗程中更好地支持你。开始疗程后，你可以使用 more AI 在两次疗程之间获得持续支持。',
        'chat.findingBestTherapists': '我们正在为你寻找最匹配的治疗师。你也可以先查看所有可选治疗师。',
        'chat.match.best': '最佳匹配',
        'chat.match.great': '高度匹配',
        'chat.match.good': '良好匹配',
        'chat.match.default': '匹配',
        'chat.therapist': '治疗师',
        'chat.matchReasonFallback': '基于你的需求，这是一个不错的匹配',
        'chat.bookSessionWith': '预约与 {name} 的疗程',
        'chat.topMatch': '首选匹配',
        'chat.yourTherapist': '你的治疗师',
        'selection.unableToLoad': '无法加载治疗师',
        'selection.ensureServer': '请确认服务器正在运行后重试。',
        'selection.noneLoaded': '未加载任何治疗师',
        'selection.specialization': '专长',
        'selection.language': '语言',
        'selection.sessionType': '疗程类型',
        'selection.both': '两者',
        'selection.any': '不限',
        'selection.yearsShort': '年',
        'selection.viewProfile': '查看资料',
        'booking.session': '疗程',
        'booking.selectDateFromCalendar': '请先从日历选择日期',
        'booking.noTimesThisDay': '当天没有可用时段',
        'booking.bookAt': '预约 {sessionType} - {date} {time}',
        'booking.selectDateTimeAlert': '请选择日期和时间',
        'booking.booking': '预约中...',
        'booking.slotJustBooked': '该时段刚被预约，请选择其他时间。',
        'booking.patient': '来访者',
        'booking.failed': '预约失败',
        'booking.level.junior': '初级',
        'booking.level.mid': '中级',
        'booking.level.senior': '资深',
        'booking.mode.online': '在线',
        'booking.mode.in_person': '面对面',
        'booking.mode.both': '在线及面对面',
        'booking.bio.generated': '持证{level}治疗师，拥有 {years} 年经验，专长包括 {specializations}。我提供{sessionMode}疗程。',
        'onboarding.prev': '上一题',
        'onboarding.next': '下一题',
        'onboarding.selectOption': '请选择一个选项',
        'onboarding.selectCountry': '请选择你的国家',
        'onboarding.required': '此字段为必填项',
        'onboarding.invalid': '输入无效',
        'onboarding.questionOf': '第 {current} 题，共 {total} 题',
        'onboarding.saveProfileFailed': '保存资料失败，请重试。',
        'onboarding.loginToSave': '请先登录再保存资料。',
        'onboarding.q.age.question': '你的年龄是？',
        'onboarding.q.age.placeholder': '输入你的年龄',
        'onboarding.q.age.error': '请输入 13 到 120 之间的有效年龄',
        'onboarding.q.gender.question': '你的性别是？',
        'onboarding.q.location.question': '你的所在地或国家是？',
        'onboarding.q.concerns.question': '你主要关注哪些问题？（可多选）',
        'onboarding.q.concerns.error': '请至少选择一项关注',
        'onboarding.q.previousTherapy.question': '你有过治疗经验吗？',
        'onboarding.q.communicationStyle.question': '你偏好的沟通方式是？',
        'onboarding.q.financial.question': '是否有保险或财务方面需要我们了解？',
        'onboarding.q.financial.placeholder': '可选：分享任何相关信息',
        'onboarding.opt.gender.male': '男性',
        'onboarding.opt.gender.female': '女性',
        'onboarding.opt.gender.nonBinary': '非二元',
        'onboarding.opt.gender.preferNot': '不愿透露',
        'onboarding.opt.gender.other': '其他',
        'onboarding.opt.concern.anxiety': '焦虑',
        'onboarding.opt.concern.depression': '抑郁',
        'onboarding.opt.concern.stress': '压力',
        'onboarding.opt.concern.relationships': '关系',
        'onboarding.opt.concern.work': '工作',
        'onboarding.opt.concern.family': '家庭',
        'onboarding.opt.concern.trauma': '创伤',
        'onboarding.opt.concern.other': '其他',
        'onboarding.opt.previousTherapy.yes': '有',
        'onboarding.opt.previousTherapy.no': '没有',
        'onboarding.opt.previousTherapy.somewhat': '有一点',
        'onboarding.opt.communication.text': '文字沟通',
        'onboarding.opt.communication.video': '视频通话',
        'onboarding.opt.communication.phone': '电话通话',
        'onboarding.opt.communication.inPerson': '面对面',
        'month.january': '1月',
        'month.february': '2月',
        'month.march': '3月',
        'month.april': '4月',
        'month.may': '5月',
        'month.june': '6月',
        'month.july': '7月',
        'month.august': '8月',
        'month.september': '9月',
        'month.october': '10月',
        'month.november': '11月',
        'month.december': '12月'
        ,
        'taxonomy.specialization.anxiety': '焦虑',
        'taxonomy.specialization.depression': '抑郁',
        'taxonomy.specialization.stress': '压力',
        'taxonomy.specialization.relationships': '关系',
        'taxonomy.specialization.family': '家庭',
        'taxonomy.specialization.trauma': '创伤',
        'taxonomy.specialization.work': '工作',
        'taxonomy.specialization.grief': '哀伤',
        'taxonomy.specialization.addiction': '成瘾',
        'taxonomy.specialization.eating_disorders': '饮食失调',
        'taxonomy.specialization.ptsd': '创伤后应激障碍',
        'taxonomy.specialization.ocd': '强迫症',
        'taxonomy.specialization.bipolar': '双相情感障碍',
        'taxonomy.specialization.adhd': '注意缺陷多动障碍',
        'taxonomy.specialization.autism': '自闭症谱系',
        'taxonomy.specialization.sleep': '睡眠问题',
        'taxonomy.specialization.anger': '愤怒管理',
        'taxonomy.specialization.self_esteem': '自尊',
        'taxonomy.specialization.lgbtq_plus': 'LGBTQ+',
        'taxonomy.specialization.couples': '伴侣关系',
        'taxonomy.specialization.teen': '青少年',
        'taxonomy.specialization.elderly': '老年',
        'taxonomy.specialization.mens_issues': '男性议题',
        'taxonomy.specialization.womens_issues': '女性议题',
        'taxonomy.specialization.career': '职业发展',
        'taxonomy.specialization.life_transitions': '人生转变',
        'taxonomy.language.english': '英语',
        'taxonomy.language.spanish': '西班牙语',
        'taxonomy.language.mandarin': '普通话',
        'taxonomy.language.cantonese': '粤语',
        'taxonomy.language.french': '法语',
        'taxonomy.language.german': '德语',
        'taxonomy.language.japanese': '日语',
        'taxonomy.language.korean': '韩语',
        'taxonomy.language.portuguese': '葡萄牙语',
        'taxonomy.language.hindi': '印地语',
        'taxonomy.language.arabic': '阿拉伯语',
        'taxonomy.language.russian': '俄语',
        'taxonomy.language.italian': '意大利语',
        'taxonomy.language.dutch': '荷兰语',
        'taxonomy.language.swedish': '瑞典语',
        'taxonomy.language.norwegian': '挪威语',
        'taxonomy.language.danish': '丹麦语',
        'taxonomy.language.finnish': '芬兰语',
        'taxonomy.language.polish': '波兰语',
        'taxonomy.language.turkish': '土耳其语',
        'bio.licensed_clinical_psychologist_with_8_years_of_experience_specializing_in_anxiety_and_mood_disorders': '持证临床心理学家，拥有 8 年经验，专注焦虑与情绪障碍。',
        'bio.experienced_therapist_focusing_on_relationship_dynamics_and_family_systems': '资深治疗师，专注关系动力与家庭系统。',
        'bio.career_focused_therapist_helping_professionals_manage_work_related_stress': '专注职业议题的治疗师，帮助专业人士管理工作压力。',
        'bio.licensed_clinical_psychologist_with_8_years_of_experience_specializing_in_anxiety_and_mood_disorders_i_use_evidence_based_approaches_including_cbt_and_mindfulness': '持证临床心理学家，拥有 8 年经验，专注焦虑与情绪障碍。我采用循证方法，包括 CBT 与正念治疗。',
        'bio.experienced_therapist_focusing_on_relationship_dynamics_and_family_systems_i_help_individuals_and_couples_navigate_complex_interpersonal_challenges': '资深治疗师，专注关系动力与家庭系统。我帮助个人和伴侣应对复杂的人际挑战。',
        'bio.career_focused_therapist_helping_professionals_manage_work_related_stress_and_achieve_work_life_balance_specialized_in_workplace_anxiety_and_burnout': '专注职业议题的治疗师，帮助专业人士管理工作压力并实现工作与生活平衡，擅长职场焦虑与倦怠。',
        'bio.senior_psychologist_with_extensive_experience_in_trauma_informed_care_and_depression_treatment_i_provide_a_safe_supportive_environment_for_healing': '资深心理学家，在创伤知情照护与抑郁治疗方面经验丰富。我提供安全、支持性的疗愈环境。',
        'bio.marriage_and_family_therapist_helping_individuals_and_families_build_stronger_connections_and_resolve_conflicts_effectively': '婚姻与家庭治疗师，帮助个人与家庭建立更紧密连接，并有效解决冲突。',
        'bio.cognitive_behavioral_therapist_specializing_in_anxiety_disorders_and_stress_management_i_help_clients_develop_practical_coping_strategies': '认知行为治疗师，专长焦虑障碍与压力管理。我帮助来访者建立实用的应对策略。',
        'bio.compassionate_therapist_with_expertise_in_treating_depression_and_anxiety_i_use_an_integrative_approach_tailored_to_each_clients_unique_needs': '富有同理心的治疗师，专长治疗抑郁和焦虑。我采用整合式方法，针对每位来访者的独特需求制定方案。',
        'bio.executive_coach_and_therapist_helping_professionals_navigate_career_challenges_and_improve_workplace_relationships': '高管教练兼治疗师，帮助专业人士应对职业挑战并改善职场关系。',
        'bio.family_systems_therapist_with_deep_expertise_in_trauma_recovery_and_relationship_healing_i_create_a_nurturing_space_for_transformation': '家庭系统治疗师，在创伤复原与关系修复方面具有深厚经验。我会打造一个滋养且安全的转变空间。',
        'bio.young_energetic_therapist_specializing_in_helping_millennials_and_gen_z_navigate_modern_life_challenges_anxiety_and_career_transitions': '年轻且充满活力的治疗师，专门帮助千禧一代和 Z 世代应对现代生活挑战、焦虑与职业转型。',
    }
};

const LANGUAGES = [
    { code: 'en', label: 'English', short: 'EN', flag: '🇬🇧' },
    { code: 'yue', label: '廣東話', short: '粵', flag: '🇭🇰' },
    { code: 'zh', label: '普通话', short: '中', flag: '🇨🇳' }
];

function getStoredLanguage() {
    try {
        const stored = localStorage.getItem(I18N_STORAGE_KEY);
        if (stored && translations[stored]) return stored;
    } catch (e) {}
    return 'en';
}

function setLanguage(code) {
    if (!translations[code]) return false;
    try {
        localStorage.setItem(I18N_STORAGE_KEY, code);
    } catch (e) {}
    applyTranslations();
    updateLanguageSelector();
    updateHtmlLang(code);
    return true;
}

function getLanguage() {
    return getStoredLanguage();
}

function t(key) {
    const lang = getStoredLanguage();
    const dict = translations[lang] || translations.en;
    return dict[key] !== undefined ? dict[key] : (translations.en[key] || key);
}

function tParam(key, params) {
    let str = t(key);
    Object.keys(params || {}).forEach(k => {
        str = str.replace(new RegExp('\\{' + k + '\\}', 'g'), params[k]);
    });
    return str;
}

function updateHtmlLang(code) {
    const html = document.documentElement;
    if (code === 'zh') html.setAttribute('lang', 'zh-CN');
    else if (code === 'yue') html.setAttribute('lang', 'zh-HK');
    else html.setAttribute('lang', 'en');
}

function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const val = t(key);
        if (val) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                if (el.placeholder !== undefined) el.placeholder = val;
                else if (el.type !== 'password' && el.type !== 'email') el.value = val;
            } else {
                el.textContent = val;
            }
        }
    });
    // Trigger custom event for JS that renders dynamic content
    window.dispatchEvent(new CustomEvent('i18n-updated', { detail: { lang: getStoredLanguage() } }));
}

function renderLanguageSelector(container) {
    if (!container) return;
    const current = getStoredLanguage();
    const currentLang = LANGUAGES.find(l => l.code === current) || LANGUAGES[0];
    container.innerHTML = `
        <div class="lang-selector" id="lang-selector">
            <button type="button" class="lang-selector-btn" id="lang-selector-btn"
                    aria-haspopup="listbox" aria-expanded="false" aria-label="Select language">
                <svg class="lang-selector-globe" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                <span class="lang-selector-current">${currentLang.short}</span>
                <svg class="lang-selector-chevron" width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="2"><path d="M2.5 4l2.5 2.5 2.5-2.5"/></svg>
            </button>
            <div class="lang-selector-dropdown" id="lang-selector-dropdown" role="listbox">
                ${LANGUAGES.map(l => `
                    <button type="button" class="lang-selector-option${l.code === current ? ' active' : ''}" data-lang="${l.code}" role="option">
                        <span class="lang-option-flag">${l.flag}</span>
                        <span class="lang-option-label">${l.label}</span>
                        <span class="lang-option-check"></span>
                    </button>
                `).join('')}
            </div>
        </div>
    `;
    const btn = container.querySelector('#lang-selector-btn');
    const dropdown = container.querySelector('#lang-selector-dropdown');
    btn?.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = dropdown?.classList.toggle('open');
        btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    container.querySelectorAll('.lang-selector-option').forEach(opt => {
        opt.addEventListener('click', (e) => {
            e.stopPropagation();
            const code = opt.getAttribute('data-lang');
            if (code && setLanguage(code)) {
                dropdown?.classList.remove('open');
                btn.setAttribute('aria-expanded', 'false');
            }
        });
    });
    document.addEventListener('click', () => {
        dropdown?.classList.remove('open');
        btn?.setAttribute('aria-expanded', 'false');
    });
}

function updateLanguageSelector() {
    const current = getStoredLanguage();
    const currentLang = LANGUAGES.find(l => l.code === current) || LANGUAGES[0];
    const shortLabel = document.querySelector('#lang-selector-btn .lang-selector-current');
    if (shortLabel) {
        shortLabel.textContent = currentLang.short;
    }
    document.querySelectorAll('.lang-selector-option').forEach(opt => {
        opt.classList.toggle('active', opt.getAttribute('data-lang') === current);
    });
}

function initMobileNav() {
    const nav = document.querySelector('.nav');
    const header = document.querySelector('.header');
    if (!nav || !header) return;

    const links = Array.from(nav.querySelectorAll('.nav-link, .nav-login-btn'));
    if (links.length === 0) return;

    const burger = document.createElement('button');
    burger.className = 'nav-burger';
    burger.setAttribute('aria-label', 'Menu');
    burger.innerHTML = '<span class="nav-burger-line"></span><span class="nav-burger-line"></span><span class="nav-burger-line"></span>';

    const overlay = document.createElement('div');
    overlay.className = 'nav-mobile-overlay';

    const panel = document.createElement('div');
    panel.className = 'nav-mobile-panel';

    links.forEach(link => {
        const a = document.createElement('a');
        a.href = link.href || '#';
        a.className = 'nav-mobile-link';
        if (link.classList.contains('nav-login-btn')) {
            a.className += ' nav-mobile-login';
        }
        a.textContent = link.textContent;
        if (link.dataset.i18n) a.dataset.i18n = link.dataset.i18n;
        if (link.id) a.dataset.refId = link.id;
        panel.appendChild(a);
    });

    const mobileLangWrap = document.createElement('div');
    mobileLangWrap.className = 'nav-mobile-lang';
    panel.appendChild(mobileLangWrap);
    renderLanguageSelector(mobileLangWrap);

    nav.appendChild(burger);
    document.body.appendChild(overlay);
    document.body.appendChild(panel);

    function toggleMenu(open) {
        const isOpen = typeof open === 'boolean' ? open : !panel.classList.contains('open');
        burger.classList.toggle('open', isOpen);
        panel.classList.toggle('open', isOpen);
        overlay.classList.toggle('open', isOpen);
        overlay.style.display = isOpen ? 'block' : 'none';
        document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    burger.addEventListener('click', (e) => { e.stopPropagation(); toggleMenu(); });
    overlay.addEventListener('click', () => toggleMenu(false));
    panel.querySelectorAll('.nav-mobile-link').forEach(link => {
        link.addEventListener('click', () => toggleMenu(false));
    });
}

function initI18n(headerNavSelector = '.nav', insertBeforeLast = true) {
    updateHtmlLang(getStoredLanguage());
    applyTranslations();
    const nav = document.querySelector(headerNavSelector);
    if (nav) {
        const langWrap = document.createElement('div');
        langWrap.className = 'lang-selector-wrap';
        if (insertBeforeLast && nav.lastChild) {
            nav.insertBefore(langWrap, nav.lastChild);
        } else {
            nav.appendChild(langWrap);
        }
        renderLanguageSelector(langWrap);
    }
    initMobileNav();
}

function initI18nLogin(containerSelector) {
    updateHtmlLang(getStoredLanguage());
    applyTranslations();
    const container = document.querySelector(containerSelector);
    if (container) {
        const langWrap = document.createElement('div');
        langWrap.className = 'lang-selector-wrap lang-selector-login';
        container.appendChild(langWrap);
        renderLanguageSelector(langWrap);
    }
}
