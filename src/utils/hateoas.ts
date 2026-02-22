// HATEOAS Helper - Hypermedia As The Engine Of Application State

export interface Link {
    rel: string;
    href: string;
    method: string;
}

export const addCampaignLinks = (campaign: any, userId?: string): any => {
    const links: Link[] = [
        {
            rel: 'self',
            href: `/api/campaigns/${campaign._id}`,
            method: 'GET'
        },
        {
            rel: 'all-campaigns',
            href: '/api/campaigns',
            method: 'GET'
        }
    ];

    // If user is the campaign owner
    if (userId && campaign.creatorId.toString() === userId.toString()) {
        links.push(
            {
                rel: 'update',
                href: `/api/campaigns/${campaign._id}`,
                method: 'PATCH'
            },
            {
                rel: 'delete',
                href: `/api/campaigns/${campaign._id}`,
                method: 'DELETE'
            },
            {
                rel: 'applications',
                href: `/api/applications/campaign/${campaign._id}`,
                method: 'GET'
            }
        );
    } else {
        // If user is not the owner (influencer)
        links.push({
            rel: 'apply',
            href: `/api/campaigns/${campaign._id}/join`,
            method: 'POST'
        });
    }

    return {
        ...campaign.toObject ? campaign.toObject() : campaign,
        _links: links
    };
};

export const addApplicationLinks = (application: any, userId?: string): any => {
    const links: Link[] = [
        {
            rel: 'self',
            href: `/api/applications/${application._id}`,
            method: 'GET'
        },
        {
            rel: 'campaign',
            href: `/api/campaigns/${application.campaignId}`,
            method: 'GET'
        }
    ];

    // If user is the brand owner
    if (userId && application.brandId.toString() === userId.toString()) {
        if (application.status === 'pending') {
            links.push(
                {
                    rel: 'accept',
                    href: `/api/applications/${application._id}/status`,
                    method: 'PATCH'
                },
                {
                    rel: 'reject',
                    href: `/api/applications/${application._id}/status`,
                    method: 'PATCH'
                }
            );
        }
    }

    return {
        ...application.toObject ? application.toObject() : application,
        _links: links
    };
};

export const addPaginationLinks = (baseUrl: string, page: number, limit: number, total: number) => {
    const totalPages = Math.ceil(total / limit);
    const links: Link[] = [
        {
            rel: 'self',
            href: `${baseUrl}?page=${page}&limit=${limit}`,
            method: 'GET'
        }
    ];

    if (page > 1) {
        links.push({
            rel: 'first',
            href: `${baseUrl}?page=1&limit=${limit}`,
            method: 'GET'
        });
        links.push({
            rel: 'prev',
            href: `${baseUrl}?page=${page - 1}&limit=${limit}`,
            method: 'GET'
        });
    }

    if (page < totalPages) {
        links.push({
            rel: 'next',
            href: `${baseUrl}?page=${page + 1}&limit=${limit}`,
            method: 'GET'
        });
        links.push({
            rel: 'last',
            href: `${baseUrl}?page=${totalPages}&limit=${limit}`,
            method: 'GET'
        });
    }

    return links;
};
