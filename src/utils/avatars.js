export const AVATARS = [
    { id: 'av-1', emoji: '🥗', bgColor: '#e8f5e9', label: 'Healthy Eater' },
    { id: 'av-2', emoji: '🥑', bgColor: '#f1f8e9', label: 'Avocado Lover' },
    { id: 'av-3', emoji: '🍎', bgColor: '#ffebee', label: 'Apple Fan' },
    { id: 'av-4', emoji: '🥦', bgColor: '#f9fbe7', label: 'Veggie King' },
    { id: 'av-5', emoji: '🏃', bgColor: '#e3f2fd', label: 'Runner' },
    { id: 'av-6', emoji: '🧘', bgColor: '#f3e5f5', label: 'Zen' },
    { id: 'av-7', emoji: '💪', bgColor: '#efebe9', label: 'Strong' },
    { id: 'av-8', emoji: '💧', bgColor: '#e0f7fa', label: 'Hydrated' },
    { id: 'av-9', emoji: '🥝', bgColor: '#f0f4c3', label: 'Kiwi' },
    { id: 'av-10', emoji: '🍍', bgColor: '#fffde7', label: 'Tropical' },
    { id: 'av-11', emoji: '🍓', bgColor: '#fff0f0', label: 'Berry' },
    { id: 'av-12', emoji: '🚴', bgColor: '#e8eaf6', label: 'Cyclist' }
];

export const getAvatarById = (id) => AVATARS.find(a => a.id === id) || AVATARS[0];
