import {
    ResourceDefinition
} from '../src/interfaces';

export const resourcesDefinitions: Array<ResourceDefinition> = [
    {
        type: 'Article',
        collectionPath: 'articles',
        attributes: ['title', 'subtitle'],
        relationships: {
            'author': { 'type': 'Person', 'relationType': 'hasOne' },
            'comments': { 'type': 'Comment', 'relationType': 'hasMany' },
        }
    },
    {
        type: 'Person',
        collectionPath: 'people',
        attributes: ['name'],
        relationships: {
            'blog': { 'type': 'Blog', 'relationType': 'hasOne' }
        }
    },
    {
        type: 'Comment',
        collectionPath: 'comments',
        attributes: ['text'],
        relationships: {}
    },
    {
        type: 'Blog',
        collectionPath: 'blogs',
        attributes: ['name'],
        relationships: {}
    }
];

export const documentPayload = {
    data: [
        {
            type: 'Article',
            id: '1',
            attributes: {
                'title': 'JSON API paints my bikeshed!'
            }
        },
        {
            type: 'Article',
            id: '2',
            attributes: {
                'title': 'Untitled'
            }
        }
    ],
    included: [
        {
            type: 'Person',
            id: '1',
            attributes: {
                'name': 'Person 1'
            }
        },
        {
            type: 'Person',
            id: '2',
            attributes: {
                'name': 'Person 2'
            }
        }
    ]
};

export const selectorsPayload = {
    data: [
        {
            type: "Article",
            id: "1",
            attributes: {
                "title": "JSON API paints my bikeshed!"
            },
            relationships: {
                'author': {
                    data: { type: 'Person', id: "1" }
                },
                'comments': {
                    data: [
                        { type: 'Comment', id: '1' },
                    ]
                }
            }
        },
        {
            type: "Article",
            id: "2",
            attributes: {
                "title": "Untitled"
            },
        },
        {
            type: "Person",
            id: "1",
            attributes: {
                "name": "Usain Bolt"
            },
            relationships: {
                'blog': {
                    data: { type: 'Blog', id: '1' }
                }
            }
        },
        {
            type: "Person",
            id: "2",
            attributes: {
                "name": "Michael Phelps"
            },
        },
        {
            type: "Comment",
            id: "1",
            attributes: {
                "text": "Uncommented"
            }
        },
        {
            type: "Comment",
            id: "2",
            attributes: {
                "text": "No comment"
            }
        },
        {
            type: "Blog",
            id: "1",
            attributes: {
                name: "Random Blog!"
            }
        }
    ]
};
