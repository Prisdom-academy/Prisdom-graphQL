import { AuthGuard } from 'src/common/guards/auth.guard';
import { ArticleInputType, ArticleReviewInput } from './../../graphql';
import { ArticleService } from './../services/article.service';
import { UseGuards } from '@nestjs/common';
import {
  Args,
  Context,
  Mutation,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { PermissionRequire } from 'src/common/decorators/PermissionRequire.decorator';

@UseGuards(AuthGuard)
@Resolver('ArticleMutation')
export class ArticleMutationResolver {
  constructor(private articleService: ArticleService) {}

  @Mutation()
  articleMutation() {
    return {};
  }

  @PermissionRequire({ blog: ['C', 'U'] })
  @ResolveField()
  setArticle(
    @Args('data') data: ArticleInputType,
    @Context() { req }: any,
    @Args('id') id?: string,
  ) {
    const token = this.articleService.getTokenFromHttpHeader(req.headers);

    if (!id) {
      return this.articleService.createArticle(data, token);
    } else {
      return this.articleService.updateArticle(data, token, id);
    }
  }

  @PermissionRequire({ blog: ['D'] })
  @ResolveField()
  async deleteArticle(@Context() { req }: any, @Args('id') id: string) {
    const token = this.articleService.getTokenFromHttpHeader(req.headers);

    await this.articleService.deleteArticle(id, token);
    
    return true;
  }

  @PermissionRequire({ blog: ['U'] })
  @ResolveField()
  async reviewArticle(
    @Context() { req }: any, 
    @Args('id') id: string, 
    @Args('data') data: ArticleReviewInput
  ) {
    const token = this.articleService.getTokenFromHttpHeader(req.headers);

    return this.articleService.reviewArticle(id, data, token)    
  }
}