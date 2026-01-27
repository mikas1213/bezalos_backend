type MessageKey = 'profilis' | 'virtuve' | 'abu' | 'nezinau' | 'offer' | 'course';
type Message = {
    text: string;
    btn: string;
}
type Messages = Record<MessageKey, Message>;

export const messages: Messages = {
    profilis: {
        text: 'Jungiantis į bendruomenę pasirinkai, kad tave domina sveikas svorio metimas, šį tikslą lengviausiai tau padės pasiekti narystė "Profilis"', 
        btn: 'Narystė'
    },
    virtuve: {
        text: 'Jungiantis į bendruomenę pasirinkai, kad tave domina išmokti sveikatai palankios mitybos pagrindų, šį tikslą lengviausiai tau padės pasiekti narystė Valgau be žalos | Virtuvėje',
        btn: 'Į Virtuvę'
    },
    abu: {
        text: 'Jungiantis į bendruomenę pasirinkai, kad tave domina išmokti sveikatai palankios mitybos pagrindų bei sveikai sumažinti savo kūno svorį, šį tikslą lengviausiai tau padės pasiekti narystė "Virtuvė"',
        btn: 'Narystė'        
    },
    nezinau: {
        text: 'Jungiantis į bendruomenę pasirinkai, kad dar nežinai kas tave šiame projekte domina, tad kviečiu pasižvalgyti',
        btn: 'Pasižvalgyti'
    },
    offer: {
        text: '',
        btn: 'ŽIŪRĖTI ĮRAŠĄ'
    },
    course: {
        text: 'Sveikiname prisijungus prie kurso',
        btn: 'Į kursą'
    }
}
