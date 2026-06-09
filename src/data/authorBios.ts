/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AuthorDetails {
  about: string;
  years: string;
  majorThemes: string[];
  externalLink?: string;
}

export const AUTHOR_BIOS: Record<string, AuthorDetails> = {
  "Isaac Asimov": {
    years: "1920 – 1992",
    about: "One of the 'Big Three' science fiction writers of the twentieth century, alongside Arthur C. Clarke and Robert A. Heinlein. Asimov was an American writer and professor of biochemistry at Boston University, best known for his Foundation and Robot series of hard science fiction, and for pioneering the famous 'Three Laws of Robotics'.",
    majorThemes: ["Hard Sci-Fi", "Psychohistory", "Automation", "Robotics", "Galactic Empires"]
  },
  "Jane Austen": {
    years: "1775 – 1817",
    about: "An English novelist known primarily for her six major novels, which interpret, critique, and comment upon the British landed gentry at the end of the 18th century. Austen's plots often explore the dependence of women on marriage in the pursuit of favorable social standing and economic security, styled with sharp irony and social realism.",
    majorThemes: ["Social Critique", "Romantic Satire", "Gentry Manners", "Moral Growth"]
  },
  "Fyodor Dostoevsky": {
    years: "1821 – 1881",
    about: "A Russian novelist, short story writer, essayist, and philosopher. Dostoevsky's literary works explore human psychology in the troubled political, social, and spiritual atmospheres of 19th-century Russia, and engage with a variety of philosophical and religious themes, often questioning modern rationalism.",
    majorThemes: ["Psychological Realism", "Spiritual Crisis", "Existential Dread", "Redemption", "Guilt"]
  },
  "George Orwell": {
    years: "1903 – 1950",
    about: "The pen name of Eric Arthur Blair, an British novelist, essayist, and critic. His work is characterized by lucid prose, biting social criticism, opposition to totalitarianism, and outspoken support for democratic socialism. His dystopian vision pioneered terms like 'Big Brother' and 'Doublethink'.",
    majorThemes: ["Anti-Totalitarianism", "Political Satire", "Dystopia", "Social Injustice", "Class Struggle"]
  },
  "Leo Tolstoy": {
    years: "1828 – 1910",
    about: "A Russian writer widely regarded as one of the greatest authors of all time. He received nominations for the Nobel Prize in Literature and Nobel Peace Prize. He is famously known for the realist masterpieces War and Peace and Anna Karenina, alongside profound philosophical essays on non-violent resistance.",
    majorThemes: ["Epic Realism", "Moral Philosophy", "Christian Pacifism", "Russian History", "Family Dynamics"]
  },
  "Thomas Hardy": {
    years: "1840 – 1928",
    about: "An English novelist and poet. A Victorian realist in the tradition of George Eliot, he was influenced both in his novels and in his poetry by Romanticism, particularly Wordsworth. Highly critical of much in Victorian society, Hardy wrote tragic novels set in his semi-fictional county of Wessex.",
    majorThemes: ["Rural Tragedy", "Fate vs. Freewill", "Social Hypocrisy", "Industrial Transition", "Naturalism"]
  },
  "Wilkie Collins": {
    years: "1824 – 1889",
    about: "An English novelist and playwright who wrote in the mid-Victorian era. Collins was a close friend and collaborator of Charles Dickens. He is best known for his 'sensation novels', pioneering the modern detective novel with works like The Moonstone and psychological suspense with The Woman in White.",
    majorThemes: ["Sensationalism", "Detective Mystery", "Social Outcasts", "Psychological Suspense"]
  },
  "Mary Shelley": {
    years: "1797 – 1851",
    about: "English novelist best known for her Gothic masterpiece Frankenstein; or, The Modern Prometheus. Shelley was married to Percy Bysshe Shelley and was the daughter of Mary Wollstonecraft and William Godwin. Her writing pioneered the science fiction genre, exploring the bioethical boundaries of scientific ambition.",
    majorThemes: ["Gothic Horror", "Scientific hubris", "Bioethics", "Loss and Isolation", "Romanticism"]
  },
  "Jules Verne": {
    years: "1828 – 1905",
    about: "A French novelist, poet, and playwright. Verne is considered to be one of the most important science fiction authors in history, widely referred to as the 'Father of Science Fiction'. He pioneered extraordinary voyages of adventure, meticulously detailing imaginary technologies decades before their actual invention.",
    majorThemes: ["Subterranean Exploration", "Space Adventure", "Deep Sea Travel", "Scientific Romance"]
  },
  "Lois Lowry": {
    years: "b. 1937",
    about: "An acclaimed American writer of children's literature, known for her ability to tackle complex, heavy philosophical themes for young readers. He has received two John Newbery Medals for Number the Stars and her famous speculative dystopian novel The Giver.",
    majorThemes: ["Dystopian Order", "Collective Euphemisms", "Historical Remembrance", "Human Connection"]
  },
  "Chinghiz Aitmatov": {
    years: "1928 – 2008",
    about: "A legendary Kyrgyz and Russian writer, widely translated across Soviet and international literature. His work blends rich post-war socialist realism with Kyrgyz folk epics, nomads' history, and profound psychological examinations of central Asian communities undergoing modern development.",
    majorThemes: ["Kyrgyz Folklore", "Steppe Nomads", "Love and Duty", "Nature Conservation", "Moral Integrity"]
  },
  "Virginia Woolf": {
    years: "1882 – 1941",
    about: "An English writer and publisher, considered one of the most important modernist 20th-century authors. Woolf pioneered the stream of consciousness narrative style in masterpieces such as Mrs Dalloway and To the Lighthouse, alongside landmark feminist essays like A Room of One's Own.",
    majorThemes: ["Modernism", "Stream of Consciousness", "Feminist Philosophy", "Memory and Time", "Post-Impressionism"]
  },
  "Homer": {
    years: "c. 8th Century BCE",
    about: "The legendary ancient Greek poet credited as the author of the Iliad and the Odyssey, the foundational epics of Western literature. His work captures the mythological trials of heroes, the whims of the Olympian gods, and timeless themes of honor, exile, homecoming, and warfare.",
    majorThemes: ["Heroic Epic", "Divine Intervention", "Homecoming (Nostos)", "Fate", "Ancient Myth"]
  },
  "Charles Dickens": {
    years: "1812 – 1870",
    about: "The preeminent English novelist of the Victorian era. Dickens created some of the world's most iconic characters, including Oliver Twist and Ebenezer Scrooge. His novels are masterpieces of social critique, highlighting the squalor, inequality, and legal corruption of industrial London.",
    majorThemes: ["Social Inequity", "Victorian London", "Childhood Vulnerability", "Industrial Squalor", "Burlseque Satire"]
  }
};
